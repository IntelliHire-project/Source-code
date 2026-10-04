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
  getCandidateCVs,
  uploadCandidateCV,
  setActiveCandidateCV,
  deleteCandidateCV,
} = require("../controllers/authController");

const router = express.Router();

// Authentication and registration
router.post("/create-account", uploadCv, createAccount);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logout);
router.post("/change-password", authMiddleware, changePassword);

// Candidate CV management routes
router.get("/candidate/cvs", authMiddleware, getCandidateCVs);
router.post("/candidate/cvs", authMiddleware, uploadCv, uploadCandidateCV);
router.put("/candidate/cvs/:id/active", authMiddleware, setActiveCandidateCV);
router.delete("/candidate/cvs/:id", authMiddleware, deleteCandidateCV);

module.exports = router;