const fs = require('fs');
const pdf = require('pdf-parse');
const { convertPdfToXml, extractCVDataFromXml, extractCVData } = require('../services/nlpService');
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

    // Read PDF file buffer
    const dataBuffer = fs.readFileSync(file.path);

    let cvXml = null;
    let extractedData = null;

    // STEP 1: Convert CV PDF into XML representation
    console.log("\n========================================================");
    console.log("[CV Extraction Pipeline] Step 1: Converting CV PDF into XML...");
    try {
      cvXml = await convertPdfToXml(dataBuffer);
      console.log(`[CV Extraction Pipeline] Successfully converted PDF to XML (${cvXml.length} characters)`);
      console.log("--- GENERATED CV XML PREVIEW (FIRST 350 CHARACTERS) ---");
      console.log(cvXml.slice(0, 350));
      console.log("-------------------------------------------------------\n");
    } catch (xmlConvertError) {
      console.warn("[CV Extraction Pipeline] Direct PDF-to-XML conversion failed, falling back to text:", xmlConvertError.message);
    }

    // STEP 2: Extract candidate data from XML (or fallback if XML conversion failed)
    if (cvXml && cvXml.trim().length > 0) {
      console.log("[CV Extraction Pipeline] Step 2: Extracting candidate data from XML...");
      extractedData = await extractCVDataFromXml(cvXml);
      console.log("[CV Extraction Pipeline] Extraction from XML complete!");
    } else {
      console.log("[CV Extraction Pipeline] Falling back to text-based extraction via pdf-parse...");
      const pdfData = await pdf(dataBuffer);
      const cvText = pdfData.text;
      if (!cvText || cvText.trim().length === 0) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return errorResponse(res, "Could not extract text from the PDF.", 400);
      }
      extractedData = await extractCVData(cvText);
    }

    // Remove the temporary file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
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
      language: extractedData.language || null,
      skills: extractedData.skills || [],
      experience: (extractedData.experience || []).map((exp, index) => ({
        ...exp,
        id: `exp-${Date.now()}-${index}`
      })),
      education: (extractedData.education || []).map((edu, index) => ({
        ...edu,
        id: `edu-${Date.now()}-${index}`
      })),
      cvXml: cvXml ? cvXml.slice(0, 2000) : null
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
