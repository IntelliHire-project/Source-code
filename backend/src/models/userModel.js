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
  const emailVerified = role === "candidate";
  const result = await executor.query(
    `INSERT INTO users (full_name, email, password_hash, role, email_verified, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING id, full_name, email, role, email_verified, created_at`,
    [fullName, email, passwordHash, role, emailVerified]
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

const updatePassword = async (userId, newPasswordHash) => {
  await db.query(
    `UPDATE users
     SET password_hash = $1
     WHERE id = $2`,
    [newPasswordHash, userId]
  );
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findAllUsers,
  markEmailVerified,
  updatePassword,
};
