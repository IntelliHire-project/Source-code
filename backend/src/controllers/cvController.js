const fs = require('fs');
const pdf = require('pdf-parse');
const { extractCVData } = require('../services/nlpService');
const { findUserById } = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/response');

const uploadCV = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return errorResponse(res, "No CV file uploaded.", 400);
    }

    if (file.mimetype !== 'application/pdf') {
      // Remove the temp file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return errorResponse(res, "Only PDF files are supported.", 400);
    }

    if (file.size < 10) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return errorResponse(res, "Uploaded file is empty or corrupted.", 400);
    }

    // Read PDF file
    const dataBuffer = fs.readFileSync(file.path);
    
    let pdfData;
    try {
      pdfData = await pdf(dataBuffer);
    } catch (parseError) {
      console.error("PDF Parse Error:", parseError);
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return errorResponse(res, "Failed to parse PDF document.", 400);
    }

    const cvText = pdfData.text;

    if (!cvText || cvText.trim().length === 0) {
      fs.unlinkSync(file.path);
      return errorResponse(res, "Could not extract text from the PDF.", 400);
    }

    console.log("\n--- SUCCESSFULLY EXTRACTED TEXT FROM PDF ---");
    console.log(cvText);
    console.log("--------------------------------------------\n");

    // Extract skills, experience, and education using NLP service
    const extractedData = await extractCVData(cvText);

    // Remove the temporary file
    fs.unlinkSync(file.path);

    return successResponse(res, "CV processed successfully.", {
      name: extractedData.name || null,
      email: extractedData.email || null,
      phone: extractedData.phone || null,
      location: extractedData.location || null,
      headline: extractedData.headline || null,
      linkedin: extractedData.linkedin || null,
      bio: extractedData.bio || null,
      language: extractedData.language || null,
      skills: extractedData.skills || [],
      experience: (extractedData.experience || []).map((exp, index) => ({
        ...exp,
        id: `exp-${Date.now()}-${index}`
      })),
      education: (extractedData.education || []).map((edu, index) => ({
        ...edu,
        id: `edu-${Date.now()}-${index}`
      }))
    });

  } catch (error) {
    console.error("Error processing CV:", error);
    // Cleanup on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return errorResponse(res, "An error occurred while processing the CV.", 500);
  }
};

module.exports = {
  uploadCV
};
