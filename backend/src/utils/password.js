const { randomBytes, scryptSync } = require("crypto");

/**
 * Hashes a plaintext password using a random 16-byte salt and scrypt derivation.
 * @param {string} password - Plain text password
 * @returns {string} Colon-separated salt and hashed key
 */
const hashPassword = (password) => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${derivedKey}`;
};

/**
 * Verifies a plaintext password against a stored hash string.
 * @param {string} password - Plain text password to check
 * @param {string} storedHash - Stored hash string containing salt and derived key
 * @returns {boolean} True if password matches the hash, false otherwise
 */
const verifyPassword = (password, storedHash) => {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return key === derivedKey;
};

module.exports = {
  hashPassword,
  verifyPassword,
};
