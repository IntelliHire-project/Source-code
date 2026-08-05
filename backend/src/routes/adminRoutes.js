const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const userModel = require("../models/userModel");
const { successResponse } = require("../utils/response");

const router = express.Router();

/**
 * Admin-only: lists all registered users.
 */
router.get("/users", authMiddleware, requireRole("admin"), async (req, res, next) => {
  try {
    const users = await userModel.findAllUsers();
    return successResponse(res, "Users fetched successfully.", { users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
