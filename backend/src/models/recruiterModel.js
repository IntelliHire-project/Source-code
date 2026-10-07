const db = require("../config/db");

/**
 * Creates a recruiter profile record linked to a user.
 */
const createRecruiter = async (
  userId,
  recruiterData,
  approvalStatus = "pending",
  client = null
) => {
  const {
    companyName,
    industry,
    companyWebsite,
    companyRegNumber,
    companyLocation,
    companyLinkedin,
    jobTitle,
    phoneNumber,
    linkedinUrl
  } = recruiterData;

  const executor = client || db;
  const result = await executor.query(
    `INSERT INTO recruiters (
      user_id, company_name, industry, company_website, company_reg_number, 
      company_location, company_linkedin, job_title, phone_number, linkedin_url, 
      approval_status, created_at, updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
     RETURNING *`,
    [
      userId, companyName, industry, companyWebsite || null, companyRegNumber || null,
      companyLocation || null, companyLinkedin || null, jobTitle || null, phoneNumber || null,
      linkedinUrl || null, approvalStatus
    ]
  );
  return result.rows[0];
};

/**
 * Finds recruiter profile by user ID.
 */
const findRecruiterByUserId = async (userId) => {
  const result = await db.query(
    `SELECT *
     FROM recruiters
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Updates a recruiter's approval status (e.g. pending, approved, rejected).
 * @param {number} recruiterId 
 * @param {string} approvalStatus 
 * @returns {Promise<object|null>}
 */
const updateApprovalStatus = async (recruiterId, approvalStatus) => {
  const result = await db.query(
    `UPDATE recruiters
     SET approval_status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, user_id, company_name, industry, approval_status, updated_at`,
    [approvalStatus, recruiterId]
  );
  return result.rows[0] || null;
};

/**
 * Lists all recruiters with user account details for admin dashboard.
 * @returns {Promise<object[]>}
 */
const findAllRecruiters = async () => {
  const result = await db.query(
    `SELECT r.id, r.user_id, u.full_name AS contact_name, u.email, r.company_name, r.industry, r.approval_status, r.created_at
     FROM recruiters r
     JOIN users u ON r.user_id = u.id
     ORDER BY r.created_at DESC`
  );
  return result.rows;
};

module.exports = {
  createRecruiter,
  findRecruiterByUserId,
  updateApprovalStatus,
  findAllRecruiters,
};
