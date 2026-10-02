const { errorResponse } = require("../utils/response");

/**
 * Role-Based Access Control Middleware.
 * Restricts a route to a set of allowed roles.
 * @param {...string} allowedRoles - Roles permitted to access the route
 * @returns {function} Express middleware
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return errorResponse(res, "Access denied. User role is unknown.", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, "Access denied. You do not have permission to access this resource.", 403);
    }

    return next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireRole;
