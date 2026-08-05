const { verifyToken } = require("../services/tokenService");
const { errorResponse } = require("../utils/response");

/**
 * Authentication Middleware.
 * Protects routes by validating the JWT supplied via the Authorization header.
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Access denied. No authentication token provided.", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      fullName: decoded.fullName,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return errorResponse(res, "Invalid or expired authentication token.", 401);
  }
};

module.exports = authMiddleware;
