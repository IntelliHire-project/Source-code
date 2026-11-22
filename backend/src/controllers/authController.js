const pool = require("../config/db");
const userModel = require("../models/userModel");
const candidateModel = require("../models/candidateModel");
const recruiterModel = require("../models/recruiterModel");
const cloudinaryService = require("../services/cloudinaryService");
const { extractTextFromBuffer } = require("../services/cvTextService");
const { hashPassword, verifyPassword } = require("../utils/password");
const { successResponse, errorResponse } = require("../utils/response");
const { signToken } = require("../services/tokenService");
const { sendPasswordResetEmail } = require("../services/mailService");

const normalizeEmail = (email) => email.trim().toLowerCase();

const PUBLIC_ROLES = ["candidate", "recruiter"];

/**
 * Creates a new account with role-specific tables (candidates or recruiters).
 * Supports optional CV upload for candidates streamed to Cloudinary.
 */
const createAccount = async (req, res, next) => {
  let uploadedCv = null;
  const client = await pool.connect();

  try {
    const fullName = (req.body.fullName || req.body.name || req.body.contactName || "").trim();
    const email = (req.body.email || "").trim();
    const password = req.body.password || "";
    const confirmPassword = req.body.confirmPassword || req.body.confirm_password || password;
    const requestedRole = req.body.role || "candidate";
    const phone = (req.body.phone || "").trim();
    const companyName = (req.body.companyName || req.body.company_name || "").trim();
    const industry = (req.body.industry || "").trim();
    const companyWebsite = (req.body.companyWebsite || "").trim();
    const companyRegNumber = (req.body.companyRegNumber || "").trim();
    const companyLocation = (req.body.companyLocation || "").trim();
    const companyLinkedin = (req.body.companyLinkedin || "").trim();
    const jobTitle = (req.body.jobTitle || "").trim();
    const phoneNumber = (req.body.phoneNumber || phone || "").trim();
    const linkedinUrl = (req.body.linkedinUrl || "").trim();

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

    if (requestedRole === "recruiter") {
      if (!companyName) return errorResponse(res, "Company name is required for recruiter registration.", 400);
      if (!industry) return errorResponse(res, "Industry is required for recruiter registration.", 400);
      if (!companyWebsite) return errorResponse(res, "Company Website is required for recruiter registration.", 400);
      if (!companyRegNumber) return errorResponse(res, "Company Registration Number is required for recruiter registration.", 400);
      if (!companyLocation) return errorResponse(res, "Company Location is required for recruiter registration.", 400);
      if (!jobTitle) return errorResponse(res, "Job Title is required for recruiter registration.", 400);
      if (!phoneNumber) return errorResponse(res, "Phone Number is required for recruiter registration.", 400);
    }

    const emailAddress = normalizeEmail(email);
    const existingUser = await userModel.findUserByEmail(emailAddress);

    if (existingUser) {
      return errorResponse(res, "An account with that email already exists.", 409);
    }

    // If candidate uploaded a CV file, upload to Cloudinary and extract raw text
    if (requestedRole === "candidate" && req.file) {
      try {
        const uploadResult = await cloudinaryService.uploadBuffer(
          req.file.buffer,
          req.file.originalname
        );
        const rawText = await extractTextFromBuffer(req.file.buffer);
        const fileSizeFormatted = req.file.size
          ? `${Math.round(req.file.size / 1024)} KB`
          : null;
        uploadedCv = {
          name: req.file.originalname,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileSize: fileSizeFormatted,
          rawText,
        };
      } catch (uploadError) {
        console.error("Cloudinary CV upload error:", uploadError);
        return errorResponse(res, "Failed to upload CV file. Please try again.", 500);
      }
    }

    // Begin database transaction across users and role-specific tables
    await client.query("BEGIN");

    const passwordHash = hashPassword(password);
    const createdUser = await userModel.createUser(
      fullName,
      emailAddress,
      passwordHash,
      requestedRole,
      client
    );

    let candidateProfile = null;
    let recruiterProfile = null;
    let cvRecord = null;

    if (requestedRole === "candidate") {
      candidateProfile = await candidateModel.createCandidate(createdUser.id, phone, client);
      if (uploadedCv) {
        cvRecord = await candidateModel.addCandidateCV(
          candidateProfile.id,
          uploadedCv.name,
          uploadedCv.url,
          uploadedCv.publicId,
          true,
          client,
          uploadedCv.fileSize,
          uploadedCv.rawText,
          null
        );
        candidateProfile.cvs = [cvRecord];
        candidateProfile.activeCv = cvRecord;
      } else {
        candidateProfile.cvs = [];
        candidateProfile.activeCv = null;
      }
    } else if (requestedRole === "recruiter") {
      recruiterProfile = await recruiterModel.createRecruiter(
        createdUser.id,
        {
          companyName,
          industry,
          companyWebsite,
          companyRegNumber,
          companyLocation,
          companyLinkedin,
          jobTitle,
          phoneNumber,
          linkedinUrl,
        },
        "pending",
        client
      );
    }

    await client.query("COMMIT");

    // Extract CV data in the background to populate candidate profile fields
    if (requestedRole === "candidate" && req.file && candidateProfile) {
      try {
        const { extractCVDataFromPdf, extractCVData, localExtractFallback } = require("../services/nlpService");
        let extractedData = null;

        try {
          console.log("[Auth Candidate Signup] Extracting candidate details from CV PDF...");
          extractedData = await extractCVDataFromPdf(req.file.buffer, req.file.originalname);
        } catch (pdfErr) {
          console.warn("[Auth Candidate Signup] Direct PDF extraction failed, trying fallback:", pdfErr.message);
        }

        if (!extractedData) {
          try {
            const { parsePdfText } = require("../utils/pdfParser");
            const pdfText = await parsePdfText(req.file.buffer);
            if (pdfText && pdfText.trim().length > 0) {
              extractedData = await extractCVData(pdfText, req.file.originalname);
            }
          } catch (textErr) {
            console.warn("[Auth Candidate Signup] pdf-parse fallback failed:", textErr.message);
          }
        }

        if (!extractedData) {
          extractedData = localExtractFallback("", req.file.originalname);
        }

        if (extractedData) {
          const profileData = {
            headline: extractedData.headline || null,
            location: extractedData.location || null,
            linkedin: extractedData.linkedin || null,
            github: extractedData.github || null,
            language: extractedData.language || "English",
            bio: extractedData.bio || null,
            phone: extractedData.phone || phone || null,
            skills: extractedData.skills || [],
            experience: (extractedData.experience || []).map((exp, index) => ({
              ...exp,
              id: `exp-${Date.now()}-${index}`,
            })),
            education: (extractedData.education || []).map((edu, index) => ({
              ...edu,
              id: `edu-${Date.now()}-${index}`,
            })),
          };
          const updatedProfile = await candidateModel.updateCandidateProfileData(
            candidateProfile.id,
            profileData
          );
          if (updatedProfile) {
            updatedProfile.cvs = candidateProfile.cvs;
            updatedProfile.activeCv = candidateProfile.activeCv;
            candidateProfile = updatedProfile;
          }
        }
      } catch (err) {
        console.error("CV extraction during signup failed:", err);
      }
    }

    return successResponse(
      res,
      "Account created successfully.",
      {
        user: {
          ...createdUser,
          candidate: candidateProfile,
          recruiter: recruiterProfile,
        },
      },
      201
    );
  } catch (error) {
    await client.query("ROLLBACK");
    // Clean up uploaded file if transaction rolled back
    if (uploadedCv && uploadedCv.publicId) {
      try {
        await cloudinaryService.deleteFile(uploadedCv.publicId);
      } catch (cleanupError) {
        console.error("Failed to clean up Cloudinary asset after rollback:", cleanupError);
      }
    }
    next(error);
  } finally {
    client.release();
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

    if (user.status === "inactive") {
      return errorResponse(
        res,
        "Your account has been deactivated. Please contact an administrator.",
        403
      );
    }

    let candidateProfile = null;
    let recruiterProfile = null;

    if (user.role === "candidate") {
      candidateProfile = await candidateModel.findCandidateByUserId(user.id);
    } else if (user.role === "recruiter") {
      recruiterProfile = await recruiterModel.findRecruiterByUserId(user.id);
      if (recruiterProfile && recruiterProfile.approval_status === "pending") {
        return errorResponse(
          res,
          "Your recruiter account is pending verification by an admin. You cannot log in yet.",
          403
        );
      }
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
        candidate: candidateProfile,
        recruiter: recruiterProfile,
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
      const token = signToken({ id: user.id, email: user.email, action: "reset_password" });
      await sendPasswordResetEmail({
        to: user.email,
        fullName: user.full_name,
        token: token,
      });
    }

    return successResponse(
      res,
      "If an account exists for this email, a reset link will be sent."
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Validates the current session and returns authenticated user details including role profile.
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userModel.findUserById(req.user.id);

    if (!user) {
      return errorResponse(res, "User not found or session has expired.", 401);
    }

    let candidateProfile = null;
    let recruiterProfile = null;

    if (user.role === "candidate") {
      candidateProfile = await candidateModel.findCandidateByUserId(user.id);
    } else if (user.role === "recruiter") {
      recruiterProfile = await recruiterModel.findRecruiterByUserId(user.id);
      if (recruiterProfile && recruiterProfile.approval_status === "pending") {
        return errorResponse(
          res,
          "Your recruiter account is pending verification by an admin. You cannot log in yet.",
          403
        );
      }
    }

    return successResponse(res, "Session is active.", {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        candidate: candidateProfile,
        recruiter: recruiterProfile,
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
