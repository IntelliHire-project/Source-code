const userModel = require("../models/userModel");
const { hashPassword, verifyPassword } = require("../utils/password");
const { successResponse, errorResponse } = require("../utils/response");
const { signToken } = require("../services/tokenService");
const { sendVerificationEmail } = require("../services/mailService");
const {
  generateVerificationToken,
  hashToken,
  TOKEN_TTL_MS,
} = require("../utils/verificationToken");

const normalizeEmail = email => email.trim().toLowerCase();

const PUBLIC_ROLES = ["candidate", "recruiter"];

/**
 * Issues a verification token for a user and emails it to them.
 * @param {object} user - User record (must have id, email, full_name)
 * @returns {Promise<{devVerificationUrl?: string}>} Dev-only verification URL
 */
const issueVerification = async user => {
  const token = generateVerificationToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await userModel.setVerificationToken(user.id, hashToken(token), expiresAt);

  const result = await sendVerificationEmail({
    to: user.email,
    fullName: user.full_name,
    token,
  });

  return { devVerificationUrl: result.verificationUrl };
};

const createAccount = async (req, res, next) => {
  try {
    const fullName = (req.body.fullName || req.body.name || "").trim();
    const email = (req.body.email || "").trim();
    const password = req.body.password || "";
    const confirmPassword = req.body.confirmPassword || req.body.confirm_password || password;
    const requestedRole = req.body.role || "candidate";

    if (!fullName || !email || !password) {
      return errorResponse(res, "Full name, email, and password are required.", 400);
    }

    if (password !== confirmPassword) {
      return errorResponse(res, "Password and confirmation do not match.", 400);
    }

    if (password.length < 8) {
      return errorResponse(res, "Password must be at least 8 characters long.", 400);
    }

    if (!PUBLIC_ROLES.includes(requestedRole)) {
      return errorResponse(res, "Invalid account role.", 400);
    }

    const emailAddress = normalizeEmail(email);

    const existingUser = await userModel.findUserByEmail(emailAddress);

    if (existingUser) {
      return errorResponse(res, "An account with that email already exists.", 409);
    }

    const passwordHash = hashPassword(password);

    const createdUser = await userModel.createUser(fullName, emailAddress, passwordHash, requestedRole);

    let devVerificationUrl;
    try {
      const verification = await issueVerification(createdUser);
      devVerificationUrl = verification.devVerificationUrl;
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    return successResponse(
      res,
      "Account created successfully. Please verify your email to sign in.",
      { user: createdUser, ...(devVerificationUrl ? { devVerificationUrl } : {}) },
      201
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email = (req.body.email || "").trim();
    const password = req.body.password || "";

    if (!email || !password) {
      return errorResponse(res, "Email and password are required.", 400);
    }

    const emailAddress = normalizeEmail(email);

    const user = await userModel.findUserByEmail(emailAddress);

    if (!user || !verifyPassword(password, user.password_hash)) {
      return errorResponse(res, "Invalid email or password.", 401);
    }

    if (!user.email_verified) {
      return errorResponse(res, "Please verify your email before signing in.", 403);
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    });

    return successResponse(res, "Signed in successfully.", {
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const token = (req.query.token || "").trim();

    if (!token) {
      return errorResponse(res, "Verification token is missing.", 400);
    }

    const tokenHash = hashToken(token);
    const user = await userModel.findUserByVerificationToken(tokenHash);

    if (!user) {
      return errorResponse(res, "Verification token is invalid or has expired. Please request a new one.", 400);
    }

    await userModel.markEmailVerified(user.id);

    return successResponse(res, "Email verified successfully. You can now sign in.");
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const emailAddress = normalizeEmail(req.body.email || "");

    if (!emailAddress) {
      return errorResponse(res, "Email is required.", 400);
    }

    const user = await userModel.findUserByEmail(emailAddress);

    // Do not reveal whether an account exists for the given email.
    if (!user || user.email_verified) {
      return successResponse(res, "If an unverified account exists for that email, a new verification link has been sent.");
    }

    let devVerificationUrl;
    try {
      const verification = await issueVerification(user);
      devVerificationUrl = verification.devVerificationUrl;
    } catch (error) {
      console.error("Failed to resend verification email:", error);
    }

    return successResponse(res, "A new verification link has been sent to your email.", {
      ...(devVerificationUrl ? { devVerificationUrl } : {}),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAccount,
  login,
  verifyEmail,
  resendVerification,
};
