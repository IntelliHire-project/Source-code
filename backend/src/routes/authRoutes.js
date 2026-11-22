const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const { uploadCv } = require("../middlewares/uploadMiddleware");
const {
  createAccount,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  getCurrentUser,
  logout,
  changePassword,
} = require("../controllers/authController");

const {
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

// Authentication & account management
router.post("/create-account", uploadCv, createAccount);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logout);
router.post("/change-password", authMiddleware, changePassword);

// Candidate CV management routes (delegated to cvController)
router.get("/candidate/cvs", authMiddleware, getCandidateCVs);
router.post("/candidate/cvs", authMiddleware, uploadCv, uploadCandidateCV);
router.get("/candidate/cvs/:id/download", authMiddleware, downloadCandidateCV);
router.put("/candidate/cvs/:id", authMiddleware, uploadCv, replaceCandidateCV);
router.put("/candidate/cvs/:id/active", authMiddleware, setActiveCandidateCV);
router.delete("/candidate/cvs/:id", authMiddleware, deleteCandidateCV);

// CV Insights & Chat (delegated to cvInsightsController)
router.get("/candidate/cvs/:id/insights", authMiddleware, getCVInsights);
router.post("/candidate/cvs/:id/chat", authMiddleware, chatWithCV);

module.exports = router;
