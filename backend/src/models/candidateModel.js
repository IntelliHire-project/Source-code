const db = require("../config/db");

/**
 * Creates a candidate profile record linked to a user.
 * @param {object} [client=null] Optional transaction client
 * @param {number} userId - Foreign key referencing users.id
 * @param {string} [phone=""] - Contact phone number
 * @returns {Promise<object>} Created candidate record
 */
const createCandidate = async (userId, phone = "", client = null) => {
  const executor = client || db;
  const result = await executor.query(
    `INSERT INTO candidates (user_id, phone, created_at, updated_at)
     VALUES ($1, $2, NOW(), NOW())
     RETURNING id, user_id, phone, created_at, updated_at`,
    [userId, phone]
  );
  return result.rows[0];
};

/**
 * Adds a CV to candidate_cvs table.
 * If isActive is true, it deactivates any existing active CVs for this candidate first.
 * @param {number} candidateId - Foreign key referencing candidates.id
 * @param {string} cvName - Original filename (e.g., "Alexander_Resume.pdf")
 * @param {string} cvUrl - Cloudinary secure URL
 * @param {string} cvPublicId - Cloudinary public ID
 * @param {boolean} [isActive=true] - Whether this CV is currently active
 * @param {object} [client=null] - Optional transaction client
 * @returns {Promise<object>} Created CV record
 */
const addCandidateCV = async (
  candidateId,
  cvName,
  cvUrl,
  cvPublicId = null,
  isActive = true,
  client = null
) => {
  const executor = client || db;

  if (isActive) {
    await executor.query(
      `UPDATE candidate_cvs
       SET is_active = false
       WHERE candidate_id = $1`,
      [candidateId]
    );
  }

  const result = await executor.query(
    `INSERT INTO candidate_cvs (candidate_id, cv_name, cv_url, cv_public_id, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING id, candidate_id, cv_name, cv_url, cv_public_id, is_active, created_at`,
    [candidateId, cvName, cvUrl, cvPublicId, isActive]
  );
  return result.rows[0];
};

/**
 * Finds candidate profile by user ID.
 * @param {number} userId 
 * @returns {Promise<object|null>} Candidate record with CVs
 */
const findCandidateByUserId = async (userId) => {
  const candidateResult = await db.query(
    `SELECT id, user_id, phone, created_at, updated_at
     FROM candidates
     WHERE user_id = $1`,
    [userId]
  );

  const candidate = candidateResult.rows[0] || null;
  if (!candidate) return null;

  const cvsResult = await db.query(
    `SELECT id, candidate_id, cv_name, cv_url, cv_public_id, is_active, created_at
     FROM candidate_cvs
     WHERE candidate_id = $1
     ORDER BY is_active DESC, created_at DESC`,
    [candidate.id]
  );

  candidate.cvs = cvsResult.rows;
  candidate.activeCv = cvsResult.rows.find((cv) => cv.is_active) || null;

  return candidate;
};

/**
 * Lists all CVs belonging to a candidate.
 * @param {number} candidateId 
 * @returns {Promise<object[]>} List of CVs
 */
const findCandidateCVs = async (candidateId) => {
  const result = await db.query(
    `SELECT id, candidate_id, cv_name, cv_url, cv_public_id, is_active, created_at
     FROM candidate_cvs
     WHERE candidate_id = $1
     ORDER BY is_active DESC, created_at DESC`,
    [candidateId]
  );
  return result.rows;
};

/**
 * Sets a specific CV as the only active CV for a candidate.
 * @param {number} candidateId 
 * @param {number} cvId 
 * @returns {Promise<object|null>} The newly activated CV
 */
const setActiveCV = async (candidateId, cvId) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Deactivate all CVs for this candidate
    await client.query(
      `UPDATE candidate_cvs
       SET is_active = false
       WHERE candidate_id = $1`,
      [candidateId]
    );

    // Activate selected CV
    const result = await client.query(
      `UPDATE candidate_cvs
       SET is_active = true
       WHERE id = $1 AND candidate_id = $2
       RETURNING id, candidate_id, cv_name, cv_url, cv_public_id, is_active, created_at`,
      [cvId, candidateId]
    );

    await client.query("COMMIT");
    return result.rows[0] || null;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Finds a specific CV by ID and candidate ID.
 * @param {number} cvId 
 * @param {number} candidateId 
 * @returns {Promise<object|null>}
 */
const findCVById = async (cvId, candidateId) => {
  const result = await db.query(
    `SELECT id, candidate_id, cv_name, cv_url, cv_public_id, is_active, created_at
     FROM candidate_cvs
     WHERE id = $1 AND candidate_id = $2`,
    [cvId, candidateId]
  );
  return result.rows[0] || null;
};

/**
 * Deletes a CV from the candidate_cvs table.
 * If the deleted CV was active, automatically sets the latest remaining CV as active.
 * @param {number} candidateId 
 * @param {number} cvId 
 * @returns {Promise<object|null>} The deleted CV record
 */
const deleteCV = async (candidateId, cvId) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const deletedResult = await client.query(
      `DELETE FROM candidate_cvs
       WHERE id = $1 AND candidate_id = $2
       RETURNING id, candidate_id, cv_name, cv_url, cv_public_id, is_active`,
      [cvId, candidateId]
    );

    const deleted = deletedResult.rows[0] || null;

    if (deleted && deleted.is_active) {
      // Pick the most recent remaining CV and activate it
      await client.query(
        `UPDATE candidate_cvs
         SET is_active = true
         WHERE id = (
           SELECT id FROM candidate_cvs
           WHERE candidate_id = $1
           ORDER BY created_at DESC
           LIMIT 1
         )`,
        [candidateId]
      );
    }

    await client.query("COMMIT");
    return deleted;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  createCandidate,
  addCandidateCV,
  findCandidateByUserId,
  findCandidateCVs,
  setActiveCV,
  findCVById,
  deleteCV,
};
