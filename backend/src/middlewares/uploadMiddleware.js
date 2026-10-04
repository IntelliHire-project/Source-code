const multer = require("multer");

// Use in-memory buffer storage so files can be directly streamed to Cloudinary
const storage = multer.memoryStorage();

// Allowed file extensions and MIME types for CV documents
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream", // Fallback for some browsers on doc/docx
];

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.substring(file.originalname.lastIndexOf(".")).toLowerCase();
  const validExtensions = [".pdf", ".doc", ".docx"];

  if (validExtensions.includes(ext) || ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file format. Only PDF, DOC, and DOCX files are allowed."), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
  fileFilter,
});

// Single CV file upload handler with friendly error handling
const uploadCv = (req, res, next) => {
  const handler = upload.single("cv");

  handler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          status: "error",
          message: "Uploaded CV file exceeds the 5MB size limit.",
        });
      }
      return res.status(400).json({
        status: "error",
        message: err.message,
      });
    } else if (err) {
      return res.status(400).json({
        status: "error",
        message: err.message || "File upload error.",
      });
    }
    next();
  });
};

module.exports = {
  uploadCv,
};
