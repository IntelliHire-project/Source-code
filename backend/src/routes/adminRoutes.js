const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const userModel = require("../models/userModel");
const { successResponse } = require("../utils/response");

const recruiterModel = require("../models/recruiterModel");
const { sendRecruiterApprovalEmail } = require("../services/mailService");

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
 * Admin-only: lists all recruiters.
 */
router.get("/recruiters", authMiddleware, requireRole("admin"), async (req, res, next) => {
  try {
    const recruiters = await recruiterModel.findAllRecruiters();
    return successResponse(res, "Recruiters fetched successfully.", { recruiters });
  } catch (error) {
    next(error);
  }
});

/**
 * Admin-only: update recruiter approval status.
 */
router.put("/recruiters/:id/approval", authMiddleware, requireRole("admin"), async (req, res, next) => {
  try {
    const recruiterId = parseInt(req.params.id, 10);
    const { status } = req.body;
    
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const updated = await recruiterModel.updateApprovalStatus(recruiterId, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Recruiter not found." });
    }

    // If approved, send an email
    if (status === "approved") {
       const user = await userModel.findUserById(updated.user_id);
       if (user) {
         await userModel.markEmailVerified(user.id);
         await sendRecruiterApprovalEmail({
           to: user.email, 
           fullName: user.full_name, 
           companyName: updated.company_name
         });
       }
    }

    return successResponse(res, "Approval status updated.", { recruiter: updated });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
