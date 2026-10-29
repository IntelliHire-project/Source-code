const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { uploadCv } = require("../middlewares/uploadMiddleware");

const {
  uploadCV,
  getCandidateCVs,
  uploadCandidateCV,
  replaceCandidateCV,
  setActiveCandidateCV,
  downloadCandidateCV,
  deleteCandidateCV,
} = require("../controllers/cvController");

const {
  getCVInsights,
  chatWithCV,
} = require("../controllers/cvInsightsController");

const router = express.Router();

// ── NLP extraction pipeline (disk-based upload for Python NLP service) ─────
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}.pdf`);
  },
});

const diskUpload = multer({
  storage: diskStorage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      ext === ".pdf" &&
      (file.mimetype === "application/pdf" || file.mimetype === "application/octet-stream")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format. Only PDF files are allowed."), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router.post(
  "/upload",
  authMiddleware,
  roleMiddleware("candidate"),
  diskUpload.single("cv"),
  uploadCV
);

// ── Candidate CV management (memory-based upload via uploadCv middleware) ───
router.get("/candidate/cvs", authMiddleware, getCandidateCVs);
router.post("/candidate/cvs", authMiddleware, uploadCv, uploadCandidateCV);
router.get("/candidate/cvs/:id/download", authMiddleware, downloadCandidateCV);
router.put("/candidate/cvs/:id", authMiddleware, uploadCv, replaceCandidateCV);
router.put("/candidate/cvs/:id/active", authMiddleware, setActiveCandidateCV);
router.delete("/candidate/cvs/:id", authMiddleware, deleteCandidateCV);

// ── CV Insights & AI Chat ────────────────────────────────────────────────────
router.get("/candidate/cvs/:id/insights", authMiddleware, getCVInsights);
router.post("/candidate/cvs/:id/chat", authMiddleware, chatWithCV);

module.exports = router;
