const express = require("express");

const { createAccount, login, verifyEmail, resendVerification } = require("../controllers/authController");

const router = express.Router();

router.post("/create-account", createAccount);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

module.exports = router;