const candidateModel = require("../models/candidateModel");
const { createHash } = require("crypto");
const { extractTextFromUrl } = require("../services/cvTextService");
const { buildCVInsightsInput } = require("../services/cvInsightsInput");
const { generateCVInsights, chatWithCVAssistant } = require("../services/geminiService");
const { successResponse, errorResponse } = require("../utils/response");

const getCVSourceHash = (cv, text) =>
  createHash("sha256").update(JSON.stringify([cv.cv_url || "", text])).digest("hex");

/**
 * Retrieves or generates AI insights for a candidate's CV.
 * Caches the result in the database to avoid repeated Gemini API calls.
 */
const getCVInsights = async (req, res, next) => {
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

    // Return cached insights if already generated and force re-analysis not requested
    const forceRefresh = req.query.refresh === "true";
    if (cv.insights && cv.insights.insightsVersion === 2 && cv.raw_text &&
        cv.insights.sourceHash === getCVSourceHash(cv, cv.raw_text) && !forceRefresh) {
      return successResponse(res, "CV insights retrieved successfully.", {
        insights: cv.insights,
        cvId: cv.id,
        cached: true,
      });
    }

    // If raw_text is missing, extract it from the Cloudinary URL
    let cvText = cv.raw_text;
    if (!cvText && cv.cv_url) {
      cvText = await extractTextFromUrl(cv.cv_url);
      if (cvText) {
        await candidateModel.updateCVRawText(cv.id, candidate.id, cvText);
      }
    }

    // Generate insights with Gemini
    const input = await buildCVInsightsInput(cvText, candidate);
    const insights = {
      ...(await generateCVInsights(input)),
      insightsVersion: 2,
      sourceHash: getCVSourceHash(cv, cvText),
    };

    // Cache insights in DB
    await candidateModel.updateCVInsights(cv.id, candidate.id, insights);

    return successResponse(res, "CV insights generated successfully.", {
      insights,
      cvId: cv.id,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Chat with CV Assistant grounded in the candidate's CV content.
 */
const chatWithCV = async (req, res, next) => {
  try {
    const cvId = parseInt(req.params.id, 10);
    const { message, history = [] } = req.body || {};

    if (!cvId) {
      return errorResponse(res, "Valid CV ID is required.", 400);
    }

    if (typeof message !== "string" || !message.trim() || message.length > 2000) {
      return errorResponse(res, "Message must be between 1 and 2000 characters.", 400);
    }

    if (!Array.isArray(history) || history.length > 6 ||
        !history.every((item) => item && ["user", "ai"].includes(item.role) &&
          typeof item.text === "string" && item.text.length <= 2000)) {
      return errorResponse(res, "Invalid chat history.", 400);
    }

    const candidate = await candidateModel.findCandidateByUserId(req.user.id);
    if (!candidate) {
      return errorResponse(res, "Candidate profile not found.", 404);
    }

    const cv = await candidateModel.findCVById(cvId, candidate.id);
    if (!cv) {
      return errorResponse(res, "CV not found.", 404);
    }

    // Ensure raw text is available
    let cvText = cv.raw_text;
    if (!cvText && cv.cv_url) {
      cvText = await extractTextFromUrl(cv.cv_url);
      if (cvText) {
        await candidateModel.updateCVRawText(cv.id, candidate.id, cvText);
      }
    }

    const input = await buildCVInsightsInput(cvText, candidate, {
      message: message.trim(),
      history: history.map(({ role, text }) => ({ role, text })),
    });
    const reply = await chatWithCVAssistant(input);

    return successResponse(res, "Chat response generated successfully.", {
      reply,
      cvId: cv.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCVInsights,
  chatWithCV,
};

