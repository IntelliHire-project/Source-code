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

module.exports = router;
