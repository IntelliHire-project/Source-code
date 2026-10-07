const { findCandidateByUserId, updateCandidateProfileData } = require('../models/candidateModel');
const { successResponse, errorResponse } = require('../utils/response');

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    const candidate = await findCandidateByUserId(userId);
    if (!candidate) {
      return errorResponse(res, "Candidate profile not found.", 404);
    }

    const updatedProfile = await updateCandidateProfileData(candidate.id, profileData, userId);
    if (!updatedProfile) {
      return errorResponse(res, "Failed to update profile.", 500);
    }

    return successResponse(res, "Profile updated successfully.", updatedProfile);
  } catch (error) {
    console.error("Error updating candidate profile:", error);
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      return errorResponse(res, "The email address extracted from the CV is already registered to another account. Please use your original email.", 400);
    }
    return errorResponse(res, "An error occurred while updating the profile.", 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const candidate = await findCandidateByUserId(userId);
    
    if (!candidate) {
      return errorResponse(res, "Candidate profile not found.", 404);
    }

    return successResponse(res, "Profile fetched successfully.", candidate);
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    return errorResponse(res, "An error occurred while fetching the profile.", 500);
  }
};

module.exports = {
  updateProfile,
  getProfile,
};
