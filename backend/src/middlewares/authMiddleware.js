const { errorResponse } = require("../utils/response");

/**
 * Authentication Middleware.
 * Protects routes by validating authentication credentials.
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Access denied. No authentication token provided.", 401);
    }

    const token = authHeader.split(" ")[1];

    // Placeholder: Real implementation will verify jwt (e.g. jwt.verify)
    // For now, allow requests with placeholder tokens for development ease.
    if (token === "dev-token-placeholder") {
      req.user = { id: 1, email: "dev@example.com", fullName: "Dev User" };
      return next();
    }

    return errorResponse(res, "Invalid or expired authentication token.", 401);
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
