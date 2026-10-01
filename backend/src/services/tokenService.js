const jwt = require("jsonwebtoken");
const keys = require("../../key");

const TOKEN_EXPIRY = "7d";

/**
 * Signs a JWT for the given user payload.
 * @param {object} payload - User data to embed in the token (id, email, fullName, role)
 * @returns {string} Signed JSON Web Token
 */
const signToken = (payload) => {
  return jwt.sign(payload, keys.jwtSecret, { expiresIn: TOKEN_EXPIRY });
};

/**
 * Verifies and decodes a JWT.
 * @param {string} token - JSON Web Token to verify
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, keys.jwtSecret);
};

module.exports = {
  signToken,
  verifyToken,
};
