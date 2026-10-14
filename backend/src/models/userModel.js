const db = require("../config/db");

/**
 * Creates a new user in the database.
 * @param {string} fullName 
 * @param {string} email 
 * @param {string} passwordHash 
 * @param {string} role 
 * @param {object|null} [client=null] Optional transaction client
 * @returns {Promise<object>} Created user database record
 */
const createUser = async (fullName, email, passwordHash, role = "candidate", client = null) => {
  const executor = client || db;
  const result = await executor.query(
    `INSERT INTO users (full_name, email, password_hash, role, email_verified, created_at)
     VALUES ($1, $2, $3, $4, true, NOW())
     RETURNING id, full_name, email, role, email_verified, created_at`,
    [fullName, email, passwordHash, role]
  );
  return result.rows[0];
};

/**
 * Finds user by their email address.
 * @param {string} email 
 * @returns {Promise<object|null>} User record or null if not found
 */
const findUserByEmail = async (email) => {
  const result = await db.query(
    `SELECT id, full_name, email, password_hash, role, COALESCE(status, 'active') AS status, email_verified, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

/**
 * Marks a user's email as verified.
 * @param {number} userId 
 */
const markEmailVerified = async (userId) => {
  await db.query(
    `UPDATE users
     SET email_verified = true
     WHERE id = $1`,
    [userId]
  );
};

/**
 * Finds user by their unique database ID.
 * @param {number} id 
 * @returns {Promise<object|null>} User record or null if not found
 */
const findUserById = async (id) => {
  const result = await db.query(
    `SELECT id, full_name, email, role, COALESCE(status, 'active') AS status, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Lists all users (without password hashes) newest first.
 * @returns {Promise<object[]>} List of user records
 */
const findAllUsers = async () => {
  const result = await db.query(
    `SELECT u.id, u.full_name, u.email, u.role, COALESCE(u.status, 'active') AS status, u.created_at, 
            r.approval_status AS recruiter_status, r.company_name, r.industry,
            r.company_website, r.company_reg_number, r.company_location, 
            r.company_linkedin, r.job_title, r.phone_number, r.linkedin_url,
            r.updated_at AS recruiter_updated_at
     FROM users u
     LEFT JOIN recruiters r ON u.id = r.user_id
     ORDER BY u.created_at DESC`
  );
  return result.rows;
};

const updatePassword = async (userId, newPasswordHash) => {
  await db.query(
    `UPDATE users
     SET password_hash = $1
     WHERE id = $2`,
    [newPasswordHash, userId]
  );
};

const updateUser = async (userId, fullName, email, role = null, status = null) => {
  const result = await db.query(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         email = COALESCE($2, email),
         role = COALESCE($3, role),
         status = COALESCE($4, status)
     WHERE id = $5
     RETURNING id, full_name, email, role, status, created_at`,
    [fullName, email, role, status, userId]
  );
  return result.rows[0] || null;
};

/**
 * Updates a user's active/inactive status in the database.
 * @param {number} userId 
 * @param {string} status 'active' | 'inactive' | 'pending'
 * @returns {Promise<object|null>} Updated user record
 */
const updateUserStatus = async (userId, status) => {
  const result = await db.query(
    `UPDATE users
     SET status = $1
     WHERE id = $2
     RETURNING id, full_name, email, role, status, created_at`,
    [status, userId]
  );
  return result.rows[0] || null;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findAllUsers,
  markEmailVerified,
  updatePassword,
  updateUser,
  updateUserStatus,
};
