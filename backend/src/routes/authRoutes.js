const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const {
  createAccount,
  login,
  verifyEmail,
  resendVerification,
  getCurrentUser,
  logout,
} = require("../controllers/authController");

const router = express.Router();

router.post("/create-account", createAccount);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logout);

module.exports = router;