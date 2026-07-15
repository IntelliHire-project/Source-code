/**
 * Sends a standardized success response.
 * @param {object} res - Express response object
 * @param {string} message - Success message
 * @param {object} [data={}] - Any optional data to return
 * @param {number} [statusCode=200] - HTTP status code
 */
const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    working: true,
    message,
    ...data,
  });
};

/**
 * Sends a standardized error response.
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} [statusCode=400] - HTTP status code
 */
const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    working: false,
    message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
