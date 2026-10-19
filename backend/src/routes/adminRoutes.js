const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const userModel = require("../models/userModel");
const recruiterModel = require("../models/recruiterModel");
const adminPaymentController = require("../controllers/adminPaymentController");
const { successResponse, errorResponse } = require("../utils/response");

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

/**
 * Admin-only: updates a recruiter's approval status.
 */
router.put("/users/:id/recruiter-status", authMiddleware, requireRole("admin"), async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return errorResponse(res, "Invalid status provided.", 400);
    }

    const recruiter = await recruiterModel.findRecruiterByUserId(userId);
    if (!recruiter) {
      return errorResponse(res, "Recruiter profile not found for this user.", 404);
    }

    const updatedRecruiter = await recruiterModel.updateApprovalStatus(recruiter.id, status);
    return successResponse(res, `Recruiter status updated to ${status}.`, { recruiter: updatedRecruiter });
  } catch (error) {
    next(error);
  }
});

/**
 * Admin-only: updates user details (full name, email, role, status).
 */
router.put("/users/:id", authMiddleware, requireRole("admin"), async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { name, email, role, status } = req.body;

    if (!name && !email && !role && !status) {
      return errorResponse(res, "At least one field (name, email, role, or status) must be provided.", 400);
    }

    const updatedUser = await userModel.updateUser(
      userId,
      name ? name.trim() : null,
      email ? email.trim().toLowerCase() : null,
      role ? role.toLowerCase() : null,
      status ? status.toLowerCase() : null
    );

    if (!updatedUser) {
      return errorResponse(res, "User not found.", 404);
    }

    return successResponse(res, "User updated successfully.", { user: updatedUser });
  } catch (error) {
    next(error);
  }
});

/**
 * Admin-only: updates user account status (active, inactive, pending).
 */
const handleUpdateUserStatus = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!status || !['active', 'inactive', 'pending'].includes(status.toLowerCase())) {
      return errorResponse(res, "Invalid status. Must be 'active', 'inactive', or 'pending'.", 400);
    }

    const updatedUser = await userModel.updateUserStatus(userId, status.toLowerCase());
    if (!updatedUser) {
      return errorResponse(res, "User not found.", 404);
    }

    return successResponse(res, `User status updated to ${status}.`, { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

router.put("/users/:id/status", authMiddleware, requireRole("admin"), handleUpdateUserStatus);
router.patch("/users/:id/status", authMiddleware, requireRole("admin"), handleUpdateUserStatus);

/**
 * Admin-only: bank-transfer payment slip verification workflow.
 */
router.get(
  "/admin/payments",
  authMiddleware,
  requireRole("admin"),
  adminPaymentController.listPayments
);

router.get(
  "/admin/payments/stats",
  authMiddleware,
  requireRole("admin"),
  adminPaymentController.getStats
);

router.patch(
  "/admin/payments/:id/review",
  authMiddleware,
  requireRole("admin"),
  adminPaymentController.reviewPayment
);

router.get(
  "/admin/payments/:id/proof",
  authMiddleware,
  requireRole("admin"),
  adminPaymentController.streamProof
);

module.exports = router;
