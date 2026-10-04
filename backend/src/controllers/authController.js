const userModel = require("../models/userModel");
const { hashPassword, verifyPassword } = require("../utils/password");
const { successResponse, errorResponse } = require("../utils/response");
const { signToken } = require("../services/tokenService");
const { sendPasswordResetEmail } = require("../services/mailService");

const normalizeEmail = email => email.trim().toLowerCase();

const PUBLIC_ROLES = ["candidate", "recruiter"];

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

    return successResponse(
      res,
      "Account created successfully.",
      { user: createdUser },
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

const verifyEmail = async (req, res) => {
  return successResponse(res, "Email verification is not required. You can sign in directly.");
};

const resendVerification = async (req, res) => {
  return successResponse(res, "Email verification is not required.");
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = (req.body.email || "").trim();
    if (!email) {
      return errorResponse(res, "Email is required.", 400);
    }
    const emailAddress = normalizeEmail(email);
    
    const user = await userModel.findUserByEmail(emailAddress);
    
    if (user) {
      const token = signToken({ id: user.id, email: user.email, action: 'reset_password' });
      await sendPasswordResetEmail({
        to: user.email,
        fullName: user.full_name,
        token: token
      });
    }

    return successResponse(res, "If an account exists for this email, a reset link will be sent.");
  } catch (error) {
    next(error);
  }
};

/**
 * Validates the current session and returns authenticated user details.
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userModel.findUserById(req.user.id);

    if (!user) {
      return errorResponse(res, "User not found or session has expired.", 401);
    }

    return successResponse(res, "Session is active.", {
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

/**
 * Handles explicit user logout on the backend.
 */
const logout = async (req, res) => {
  return successResponse(res, "Signed out successfully.");
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return errorResponse(res, "Current and new passwords are required.", 400);
    }

    if (newPassword.length < 8) {
      return errorResponse(res, "New password must be at least 8 characters long.", 400);
    }

    // req.user is set by authMiddleware
    const email = req.user.email;
    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return errorResponse(res, "User not found.", 404);
    }

    if (!verifyPassword(currentPassword, user.password_hash)) {
      return errorResponse(res, "Incorrect current password.", 401);
    }

    const newPasswordHash = hashPassword(newPassword);
    await userModel.updatePassword(user.id, newPasswordHash);

    return successResponse(res, "Password updated successfully.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAccount,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  getCurrentUser,
  logout,
  changePassword,
};
