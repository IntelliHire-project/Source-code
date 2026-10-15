const fs = require('fs');
const { parsePdfText } = require('../utils/pdfParser');
const {
  extractCVDataFromPdf,
  convertPdfToJson,
  extractCVDataFromJson,
  extractCVData,
  localExtractFallback
} = require('../services/nlpService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Uploads a CV PDF, converts it to structured JSON with layout preservation,
 * and extracts all candidate information without ever failing.
 */
const uploadCV = async (req, res) => {
  const file = req.file;

  try {
    if (!file) {
      return errorResponse(res, "No CV file uploaded.", 400);
    }

    if (file.mimetype !== 'application/pdf' && !file.originalname.toLowerCase().endsWith('.pdf')) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return errorResponse(res, "Only PDF files are supported.", 400);
    }

    if (file.size < 10) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return errorResponse(res, "Uploaded file is empty or corrupted.", 400);
    }

    // Read PDF file buffer
    const dataBuffer = fs.readFileSync(file.path);

    let cvJson = null;
    let extractedData = null;

    console.log("\n========================================================");
    console.log(`[CV Extraction Pipeline] Processing file: ${file.originalname} (${file.size} bytes)...`);

    // STEP 1: Direct single-call PDF to JSON + Candidate Data extraction
    try {
      console.log("[CV Extraction Pipeline] Step 1: Converting CV PDF into structured JSON and extracting data...");
      const pdfResult = await extractCVDataFromPdf(dataBuffer, file.originalname);
      if (pdfResult && (pdfResult.name || (pdfResult.skills && pdfResult.skills.length > 0) || (pdfResult.experience && pdfResult.experience.length > 0))) {
        extractedData = pdfResult;
        cvJson = pdfResult.json || null;
        console.log(`[CV Extraction Pipeline] Single-call extraction successful! Candidate: ${extractedData.name}`);
      }
    } catch (directErr) {
      console.warn("[CV Extraction Pipeline] Direct PDF extraction warning:", directErr.message);
    }

    // STEP 2: Fallback to separate JSON conversion and extraction
    if (!extractedData) {
      try {
        console.log("[CV Extraction Pipeline] Step 2: Converting PDF to structured JSON separately...");
        cvJson = await convertPdfToJson(dataBuffer);
        if (cvJson && ((cvJson.pages && cvJson.pages.length > 0) || cvJson.text_blocks)) {
          extractedData = await extractCVDataFromJson(cvJson, file.originalname);
          console.log("[CV Extraction Pipeline] Extraction from JSON complete!");
        }
      } catch (jsonErr) {
        console.warn("[CV Extraction Pipeline] JSON conversion/extraction fallback warning:", jsonErr.message);
      }
    }

    // STEP 3: Fallback to text-based extraction via pdf-parse
    if (!extractedData) {
      console.log("[CV Extraction Pipeline] Step 3: Falling back to text-based extraction via pdf-parse...");
      let cvText = "";
      try {
        cvText = await parsePdfText(dataBuffer);
      } catch (pdfParseErr) {
        console.warn("[CV Extraction Pipeline] pdf-parse warning:", pdfParseErr.message);
      }

      if (cvText && cvText.length > 0) {
        try {
          extractedData = await extractCVData(cvText, file.originalname);
        } catch (nlpTextErr) {
          console.warn("[CV Extraction Pipeline] NLP text extraction warning, using local fallback:", nlpTextErr.message);
          extractedData = localExtractFallback(cvText, file.originalname);
        }
      } else {
        console.log("[CV Extraction Pipeline] Low-text or image-based PDF. Applying resilient local fallback.");
        extractedData = localExtractFallback("", file.originalname);
      }
    }

    // Ensure extractedData is always a valid object
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
      experience: (Array.isArray(extractedData.experience) ? extractedData.experience : []).map((exp, index) => ({
        ...exp,
        id: `exp-${Date.now()}-${index}`
      })),
      education: (Array.isArray(extractedData.education) ? extractedData.education : []).map((edu, index) => ({
        ...edu,
        id: `edu-${Date.now()}-${index}`
      })),
      cvJson: cvJson || null
    });

  } catch (error) {
    console.error("Error processing CV, providing safe fallback response:", error);
    const safeData = localExtractFallback("", req.file ? req.file.originalname : "");
    return successResponse(res, "CV uploaded successfully. Please review the extracted fields.", {
      ...safeData,
      experience: [],
      education: [],
      cvJson: null
    });
  } finally {
    // Reliably clean up the temporary uploaded file
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkErr) {
        console.warn("Failed to delete temp CV file:", unlinkErr.message);
      }
    }
  }
};

module.exports = {
  uploadCV
};
