const userModel = require("../models/userModel");
const { hashPassword, verifyPassword } = require("../utils/password");
const { successResponse, errorResponse } = require("../utils/response");
const { signToken } = require("../services/tokenService");

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

module.exports = {
  createAccount,
  login,
  verifyEmail,
  resendVerification,
};
