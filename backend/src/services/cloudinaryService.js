const cloudinary = require("../config/cloudinary");

/**
 * Uploads a local file to Cloudinary.
 * @param {string} filePath - Path to the local file
 * @param {object} [options={}] - Extra Cloudinary configuration options
 * @returns {Promise<object>} Cloudinary upload response object
 */
const uploadFile = async (filePath, options = {}) => {
  return cloudinary.uploader.upload(filePath, {
    folder: "intellihire",
    ...options,
  });
};

/**
 * Deletes an asset from Cloudinary using its public ID.
 * @param {string} publicId - Cloudinary public ID of asset
 * @returns {Promise<object>} Cloudinary deletion result
 */
const deleteFile = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  uploadFile,
  deleteFile,
};
