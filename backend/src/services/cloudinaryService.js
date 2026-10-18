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
 * Uploads a memory buffer (e.g. from Multer memoryStorage) to Cloudinary.
 * @param {Buffer} buffer - In-memory file buffer
 * @param {string} [originalFilename="resume.pdf"] - Name of the file with extension
 * @param {object} [options={}] - Extra Cloudinary options
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadBuffer = (buffer, originalFilename = "resume.pdf", options = {}) => {
  return new Promise((resolve, reject) => {
    const ext = originalFilename.includes(".")
      ? originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase()
      : ".pdf";
    const baseName = originalFilename
      .substring(0, originalFilename.lastIndexOf(".") > -1 ? originalFilename.lastIndexOf(".") : originalFilename.length)
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "intellihire/cvs",
        resource_type: "raw",
        public_id: `${baseName}_${Date.now()}${ext}`,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Deletes an asset from Cloudinary using its public ID.
 * @param {string} publicId - Cloudinary public ID of asset
 * @param {object} [options={}] - Extra options (e.g., resource_type)
 * @returns {Promise<object>} Cloudinary deletion result
 */
const deleteFile = async (publicId, options = {}) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
    ...options,
  });
};

/**
 * Builds a short-lived signed URL for an authenticated (private) asset.
 * Used to stream payment proofs to admins without exposing a permanent URL.
 * @param {string} publicId - Cloudinary public ID of the asset
 * @param {object} [options={}] - Extra options (e.g. expires_at)
 * @returns {string} Signed download URL
 */
const getAuthenticatedDownloadUrl = (publicId, options = {}) => {
  const lastDot = publicId.lastIndexOf(".");
  const hasExtension = lastDot > -1;
  const format = hasExtension ? publicId.substring(lastDot + 1) : null;
  const baseId = hasExtension ? publicId.substring(0, lastDot) : publicId;

  return cloudinary.utils.private_download_url(baseId, format, {
    resource_type: "raw",
    type: "authenticated",
    attachment: false,
    ...options,
  });
};

module.exports = {
  uploadFile,
  uploadBuffer,
  deleteFile,
  getAuthenticatedDownloadUrl,
};
