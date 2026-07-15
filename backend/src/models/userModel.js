const db = require("../config/db");

/**
 * Creates a new user in the database.
 * @param {string} fullName 
 * @param {string} email 
 * @param {string} passwordHash 
 * @returns {Promise<object>} Created user database record
 */
const createUser = async (fullName, email, passwordHash) => {
  const result = await db.query(
    `INSERT INTO users (full_name, email, password_hash, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING id, full_name, email, created_at`,
    [fullName, email, passwordHash]
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
    `SELECT id, full_name, email, password_hash, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

/**
 * Finds user by their unique database ID.
 * @param {number} id 
 * @returns {Promise<object|null>} User record or null if not found
 */
const findUserById = async (id) => {
  const result = await db.query(
    `SELECT id, full_name, email, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};
