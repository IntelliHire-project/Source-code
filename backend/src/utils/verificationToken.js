const crypto = require("crypto");

const TOKEN_LENGTH = 32;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Generates a random verification token (raw, sent to the user).
 */
const generateVerificationToken = () => crypto.randomBytes(TOKEN_LENGTH).toString("hex");

/**
 * SHA-256 hashes a token for safe storage in the database.
 */
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

module.exports = {
  generateVerificationToken,
  hashToken,
  TOKEN_TTL_MS,
};
