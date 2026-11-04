const fs = require("fs");
const { parsePdfText } = require("../utils/pdfParser");
const {
  extractCVDataFromPdf,
  convertPdfToJson,
  extractCVDataFromJson,
  extractCVData,
  localExtractFallback,
} = require("../services/nlpService");
const candidateModel = require("../models/candidateModel");
const userModel = require("../models/userModel");
const cloudinaryService = require("../services/cloudinaryService");
const { extractTextFromBuffer } = require("../services/cvTextService");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * Uploads a CV PDF, converts it to structured JSON with layout preservation,
 * and extracts all candidate information without ever failing.
 * Used during the NLP extraction pipeline (cv/upload route).
 */
const uploadCV = async (req, res) => {
  const file = req.file;

  try {
    if (!file) {
      return errorResponse(res, "No CV file uploaded.", 400);
    }

    if (
      file.mimetype !== "application/pdf" &&
      !file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return errorResponse(res, "Only PDF files are supported.", 400);
    }

    if (file.size < 10) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return errorResponse(res, "Uploaded file is empty or corrupted.", 400);
    }

    const dataBuffer = fs.readFileSync(file.path);

    let cvJson = null;
    let extractedData = null;

    console.log("\n========================================================");
    console.log(
      `[CV Extraction Pipeline] Processing file: ${file.originalname} (${file.size} bytes)...`
    );

    // STEP 1: Direct single-call PDF to JSON + Candidate Data extraction
    try {
      console.log(
        "[CV Extraction Pipeline] Step 1: Converting CV PDF into structured JSON and extracting data..."
      );
      const pdfResult = await extractCVDataFromPdf(dataBuffer, file.originalname);
      if (
        pdfResult &&
        (pdfResult.name ||
          (pdfResult.skills && pdfResult.skills.length > 0) ||
          (pdfResult.experience && pdfResult.experience.length > 0))
      ) {
        extractedData = pdfResult;
        cvJson = pdfResult.json || null;
        console.log(
          `[CV Extraction Pipeline] Single-call extraction successful! Candidate: ${extractedData.name}`
        );
      }
    } catch (directErr) {
      console.warn(
        "[CV Extraction Pipeline] Direct PDF extraction warning:",
        directErr.message
      );
    }

    // STEP 2: Fallback to separate JSON conversion and extraction
    if (!extractedData) {
      try {
        console.log(
          "[CV Extraction Pipeline] Step 2: Converting PDF to structured JSON separately..."
        );
        cvJson = await convertPdfToJson(dataBuffer);
        if (cvJson && ((cvJson.pages && cvJson.pages.length > 0) || cvJson.text_blocks)) {
          extractedData = await extractCVDataFromJson(cvJson, file.originalname);
          console.log("[CV Extraction Pipeline] Extraction from JSON complete!");
        }
      } catch (jsonErr) {
        console.warn(
          "[CV Extraction Pipeline] JSON conversion/extraction fallback warning:",
          jsonErr.message
        );
      }
    }

    // STEP 3: Fallback to text-based extraction via pdf-parse
    if (!extractedData) {
      console.log(
        "[CV Extraction Pipeline] Step 3: Falling back to text-based extraction via pdf-parse..."
      );
      let cvText = "";
      try {
        cvText = await parsePdfText(dataBuffer);
      } catch (pdfParseErr) {
        console.warn(
          "[CV Extraction Pipeline] pdf-parse warning:",
          pdfParseErr.message
        );
      }

      if (cvText && cvText.length > 0) {
        try {
          extractedData = await extractCVData(cvText, file.originalname);
        } catch (nlpTextErr) {
          console.warn(
            "[CV Extraction Pipeline] NLP text extraction warning, using local fallback:",
            nlpTextErr.message
          );
          extractedData = localExtractFallback(cvText, file.originalname);
        }
      } else {
        console.log(
          "[CV Extraction Pipeline] Low-text or image-based PDF. Applying resilient local fallback."
        );
        extractedData = localExtractFallback("", file.originalname);
      }
    }

    if (!extractedData) {
      extractedData = localExtractFallback("", file.originalname);
    }

    console.log("Extracted Candidate Name:", extractedData.name);
    console.log("Extracted Candidate Skills:", extractedData.skills);
    console.log("========================================================\n");

    return successResponse(res, "CV processed successfully.", {
      name: extractedData.name || null,
      email: extractedData.email || null,
      phone: extractedData.phone || null,
      location: extractedData.location || null,
      headline: extractedData.headline || null,
      linkedin: extractedData.linkedin || null,
      github: extractedData.github || null,
      bio: extractedData.bio || null,
      language: extractedData.language || "English",
      skills: Array.isArray(extractedData.skills) ? extractedData.skills : [],
      experience: (Array.isArray(extractedData.experience)
        ? extractedData.experience
        : []
      ).map((exp, index) => ({ ...exp, id: `exp-${Date.now()}-${index}` })),
      education: (Array.isArray(extractedData.education)
        ? extractedData.education
        : []
      ).map((edu, index) => ({ ...edu, id: `edu-${Date.now()}-${index}` })),
      cvJson: cvJson || null,
    });
  } catch (error) {
    console.error("Error processing CV, providing safe fallback response:", error);
    const safeData = localExtractFallback("", req.file ? req.file.originalname : "");
    return successResponse(
      res,
      "CV uploaded successfully. Please review the extracted fields.",
      { ...safeData, experience: [], education: [], cvJson: null }
    );
  } finally {
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkErr) {
        console.warn("Failed to delete temp CV file:", unlinkErr.message);
      }
    }
  }
};

// ---------------------------------------------------------------------------
// Internal helper — syncs candidate profile fields from extracted CV data.
// Called after upload, replace, or setActive operations.
// ---------------------------------------------------------------------------
const syncCandidateProfileFromCV = async (candidateId, userId, pdfBuffer, originalname) => {
  try {
    const { extractCVDataFromPdf, extractCVData, localExtractFallback } = require("../services/nlpService");
    let extractedData = null;

    try {
      extractedData = await extractCVDataFromPdf(pdfBuffer, originalname);
    } catch (pdfErr) {
      console.warn("[CV Sync] Direct PDF extraction failed:", pdfErr.message);
    }

    if (!extractedData) {
      try {
        const { parsePdfText } = require("../utils/pdfParser");
        const pdfText = await parsePdfText(pdfBuffer);
        if (pdfText && pdfText.trim().length > 0) {
          extractedData = await extractCVData(pdfText, originalname);
        }
      } catch (textErr) {
        console.warn("[CV Sync] pdf-parse fallback failed:", textErr.message);
      }
    }

    if (!extractedData) {
      extractedData = localExtractFallback("", originalname);
    }

    if (extractedData) {
      const profileData = {
        headline: extractedData.headline || null,
        location: extractedData.location || null,
        linkedin: extractedData.linkedin || null,
        github: extractedData.github || null,
        language: extractedData.language || "English",
        bio: extractedData.bio || null,
        phone: extractedData.phone || null,
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
      await candidateModel.updateCandidateProfileData(candidateId, profileData);
      if (extractedData.name && userId) {
        try {
          await userModel.updateUser(userId, extractedData.name);
        } catch (uErr) {
          // Ignore name update conflict
        }
      }
    }
  } catch (err) {
    console.warn("[CV Sync] Warning updating candidate profile from CV:", err.message);
  }
};

/**
 * Gets all CVs for the authenticated candidate.
 */
const getCandidateCVs = async (req, res, next) => {
  try {
    const candidate = await candidateModel.findCandidateByUserId(req.user.id);
    if (!candidate) {
      return successResponse(res, "CVs retrieved successfully.", { cvs: [] });
    }

    const cvs = await candidateModel.findCandidateCVs(candidate.id);
    return successResponse(res, "CVs retrieved successfully.", { cvs: cvs || [] });
  } catch (error) {
    next(error);
  }
};

/**
 * Uploads a new CV for the authenticated candidate.
 */
const uploadCandidateCV = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, "Please select a CV file to upload.", 400);
    }

    let candidate = await candidateModel.findCandidateByUserId(req.user.id);
    if (!candidate) {
      candidate = await candidateModel.createCandidate(req.user.id);
    }

    const makeActive = req.body.setActive === "false" ? false : true;

    const uploadResult = await cloudinaryService.uploadBuffer(
      req.file.buffer,
      req.file.originalname
    );

    const rawText = await extractTextFromBuffer(req.file.buffer);

    const fileSizeFormatted = req.file.size
      ? `${Math.round(req.file.size / 1024)} KB`
      : null;

    const cv = await candidateModel.addCandidateCV(
      candidate.id,
      req.file.originalname,
      uploadResult.secure_url,
      uploadResult.public_id,
      makeActive,
      null,
      fileSizeFormatted,
      rawText,
      null
    );

    if (makeActive) {
      await syncCandidateProfileFromCV(
        candidate.id,
        req.user.id,
        req.file.buffer,
        req.file.originalname
      );
    }

    return successResponse(res, "CV uploaded successfully.", { cv }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Replaces an existing CV file for the candidate.
 */
const replaceCandidateCV = async (req, res, next) => {
  try {
    const cvId = parseInt(req.params.id, 10);
    if (!cvId) {
      return errorResponse(res, "Valid CV ID is required.", 400);
    }

    if (!req.file) {
      return errorResponse(res, "Please select a replacement CV file to upload.", 400);
    }

    let candidate = await candidateModel.findCandidateByUserId(req.user.id);
    if (!candidate) {
      candidate = await candidateModel.createCandidate(req.user.id);
    }

    const oldCv = await candidateModel.findCVById(cvId, candidate.id);
    if (!oldCv) {
      return errorResponse(res, "CV not found.", 404);
    }

    const uploadResult = await cloudinaryService.uploadBuffer(
      req.file.buffer,
      req.file.originalname
    );

    const rawText = await extractTextFromBuffer(req.file.buffer);

    const fileSizeFormatted = req.file.size
      ? `${Math.round(req.file.size / 1024)} KB`
      : null;

    const updatedCv = await candidateModel.updateCV(
      candidate.id,
      cvId,
      req.file.originalname,
      uploadResult.secure_url,
      uploadResult.public_id,
      fileSizeFormatted
    );

    await candidateModel.updateCVRawText(cvId, candidate.id, rawText);
    await candidateModel.updateCVInsights(cvId, candidate.id, null);

    if (oldCv.is_active) {
      await syncCandidateProfileFromCV(
        candidate.id,
        req.user.id,
        req.file.buffer,
        req.file.originalname
      );
    }

    // Clean up old Cloudinary asset
    if (oldCv.cv_public_id) {
      try {
        await cloudinaryService.deleteFile(oldCv.cv_public_id);
      } catch (err) {
        console.error("Cloudinary cleanup error during replace:", err);
      }
    }

    return successResponse(res, "CV replaced successfully.", { cv: updatedCv });
  } catch (error) {
    next(error);
  }
};

/**
 * Sets a specific CV as the active CV for the candidate.
 */
const setActiveCandidateCV = async (req, res, next) => {
  try {
    const cvId = parseInt(req.params.id, 10);
    if (!cvId) {
      return errorResponse(res, "Valid CV ID is required.", 400);
    }

    const candidate = await candidateModel.findCandidateByUserId(req.user.id);
    if (!candidate) {
      return errorResponse(res, "Candidate profile not found.", 404);
    }

    const activatedCV = await candidateModel.setActiveCV(candidate.id, cvId);
    if (!activatedCV) {
      return errorResponse(res, "CV not found or access denied.", 404);
    }

    if (activatedCV.cv_url) {
      try {
        const fetchResp = await fetch(activatedCV.cv_url);
        if (fetchResp.ok) {
          const arrayBuf = await fetchResp.arrayBuffer();
          const pdfBuffer = Buffer.from(arrayBuf);
          await syncCandidateProfileFromCV(
            candidate.id,
            req.user.id,
            pdfBuffer,
            activatedCV.cv_name
          );
        }
      } catch (syncErr) {
        console.warn("[setActiveCandidateCV] Warning syncing profile:", syncErr.message);
      }
    }

    return successResponse(res, "Active CV updated successfully.", { cv: activatedCV });
  } catch (error) {
    next(error);
  }
};

/**
 * Downloads candidate CV directly as an authentic PDF binary stream.
 */
const downloadCandidateCV = async (req, res, next) => {
  try {
    const cvId = parseInt(req.params.id, 10);
    if (!cvId) {
      return errorResponse(res, "Valid CV ID is required.", 400);
    }

    const candidate = await candidateModel.findCandidateByUserId(req.user.id);
    if (!candidate) {
      return errorResponse(res, "Candidate profile not found.", 404);
    }

    const cv = await candidateModel.findCVById(cvId, candidate.id);
    if (!cv) {
      return errorResponse(res, "CV not found.", 404);
    }

    if (cv.cv_url) {
      return res.redirect(cv.cv_url);
    }

    return errorResponse(res, "CV document URL is not found.", 404);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a CV belonging to the candidate.
 */
const deleteCandidateCV = async (req, res, next) => {
  try {
    const cvId = parseInt(req.params.id, 10);
    if (!cvId) {
      return errorResponse(res, "Valid CV ID is required.", 400);
    }

    const candidate = await candidateModel.findCandidateByUserId(req.user.id);
    if (!candidate) {
      return errorResponse(res, "Candidate profile not found.", 404);
    }

    const cv = await candidateModel.findCVById(cvId, candidate.id);
    if (!cv) {
      return errorResponse(res, "CV not found.", 404);
    }

    await candidateModel.deleteCV(candidate.id, cvId);

    if (cv.cv_public_id) {
      try {
        await cloudinaryService.deleteFile(cv.cv_public_id);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    }

    return successResponse(res, "CV deleted successfully.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadCV,
  getCandidateCVs,
  uploadCandidateCV,
  replaceCandidateCV,
  setActiveCandidateCV,
  downloadCandidateCV,
  deleteCandidateCV,
};
