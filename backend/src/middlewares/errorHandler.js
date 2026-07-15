const { errorResponse } = require("../utils/response");

/**
 * Global Express Error Handling Middleware.
 * Catches all unhandled routing errors and returns a standardized JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Server Error:", err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected error occurred on the server.";

  return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;
