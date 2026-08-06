const db = require("../config/db");

/**
 * Creates a new user in the database.
 * @param {string} fullName 
 * @param {string} email 
 * @param {string} passwordHash 
 * @returns {Promise<object>} Created user database record
 */
const createUser = async (fullName, email, passwordHash, role = "candidate") => {
  const result = await db.query(
    `INSERT INTO users (full_name, email, password_hash, role, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, full_name, email, role, created_at`,
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
    `SELECT id, full_name, email, password_hash, role, email_verified, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

/**
 * Finds a user by their (hashed) verification token that has not expired.
 * @param {string} tokenHash - SHA-256 hash of the verification token
 * @returns {Promise<object|null>} User record or null if not found
 */
const findUserByVerificationToken = async (tokenHash) => {
  const result = await db.query(
    `SELECT id, full_name, email, role, email_verified
     FROM users
     WHERE verification_token = $1
       AND verification_token_expires_at > NOW()`,
    [tokenHash]
  );
  return result.rows[0] || null;
};

/**
 * Stores a new verification token for a user.
 * @param {number} userId 
 * @param {string} tokenHash - SHA-256 hash of the verification token
 * @param {Date} expiresAt - Expiry timestamp
 */
const setVerificationToken = async (userId, tokenHash, expiresAt) => {
  await db.query(
    `UPDATE users
     SET verification_token = $2, verification_token_expires_at = $3
     WHERE id = $1`,
    [userId, tokenHash, expiresAt]
  );
};

/**
 * Marks a user's email as verified and clears the verification token.
 * @param {number} userId 
 */
const markEmailVerified = async (userId) => {
  await db.query(
    `UPDATE users
     SET email_verified = true, verification_token = NULL, verification_token_expires_at = NULL
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
    `SELECT id, full_name, email, role, created_at
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
    `SELECT id, full_name, email, role, created_at
     FROM users
     ORDER BY created_at DESC`
  );
  return result.rows;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findAllUsers,
  findUserByVerificationToken,
  setVerificationToken,
  markEmailVerified,
};
