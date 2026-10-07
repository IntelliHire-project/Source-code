const { findCandidateByUserId, updateCandidateProfileData } = require('../models/candidateModel');
const { updateUser, findUserById } = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/response');

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    const candidate = await findCandidateByUserId(userId);
    if (!candidate) {
      return errorResponse(res, "Candidate profile not found.", 404);
    }

    const updatedProfile = await updateCandidateProfileData(candidate.id, profileData);
    if (!updatedProfile) {
      return errorResponse(res, "Failed to update profile.", 500);
    }

    if (profileData.fullName || profileData.email) {
      try {
        await updateUser(userId, profileData.fullName, profileData.email);
      } catch (userUpdateErr) {
        if (userUpdateErr.code === '23505') { // Postgres unique violation
          return errorResponse(res, "The email extracted from your CV is already in use by another account. Please use a different email.", 400);
        }
        throw userUpdateErr;
      }
    }

    // optionally, refetch the user to return combined data, but returning updatedProfile is fine as the frontend relies on its own draft for now.
    return successResponse(res, "Profile updated successfully.", updatedProfile);
  } catch (error) {
    console.error("Error updating candidate profile:", error);
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
