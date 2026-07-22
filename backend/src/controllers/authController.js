const userModel = require("../models/userModel");
const { hashPassword } = require("../utils/password");
const { successResponse, errorResponse } = require("../utils/response");

const normalizeEmail = email => email.trim().toLowerCase();

const createAccount = async (req, res, next) => {
  try {
    const fullName = (req.body.fullName || req.body.name || "").trim();
    const email = (req.body.email || "").trim();
    const password = req.body.password || "";
    const confirmPassword = req.body.confirmPassword || req.body.confirm_password || password;

    if (!fullName || !email || !password) {
      return errorResponse(res, "Full name, email, and password are required.", 400);
    }

    if (password !== confirmPassword) {
      return errorResponse(res, "Password and confirmation do not match.", 400);
    }

    if (password.length < 8) {
      return errorResponse(res, "Password must be at least 8 characters long.", 400);
    }

    const emailAddress = normalizeEmail(email);

    const existingUser = await userModel.findUserByEmail(emailAddress);

    if (existingUser) {
      return errorResponse(res, "An account with that email already exists.", 409);
    }

    const passwordHash = hashPassword(password);

    const createdUser = await userModel.createUser(fullName, emailAddress, passwordHash);

    return successResponse(res, "Account created successfully.", { user: createdUser }, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAccount,
};
