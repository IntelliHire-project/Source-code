const { GoogleGenAI } = require('@google/genai');

let ai = null;

if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

/**
 * Extracts skills and experience from CV text using Google Gemini.
 * @param {string} cvText 
 * @returns {Promise<{skills: string[], experience: object[]}>}
 */
const extractCVData = async (cvText) => {
  if (!ai) {
    console.warn("GEMINI_API_KEY not found. Falling back to mock data.");
    return {
      skills: ["JavaScript", "React", "Node.js", "Express", "PostgreSQL"],
      experience: [
        {
          title: "Software Engineer",
          company: "Tech Corp",
          years: "2020 - Present",
          description: "Developed web applications."
        }
      ],
      education: [
        {
          title: "B.S. Computer Science",
          school: "State University",
          period: "2016 - 2020"
        }
      ]
    };
  }

  const prompt = `
You are an expert HR recruiter API. Extract the applicant's skills, experience, and education from the provided CV text.
Return ONLY a raw valid JSON object (without markdown formatting, no backticks, no markdown codeblocks) in the following format:
{
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "period": "Duration (e.g. 2020 - 2023)",
      "description": "Brief summary of responsibilities"
    }
  ],
  "education": [
    {
      "title": "Degree / Certificate",
      "school": "Institution Name",
      "period": "Year or Duration"
    }
  ]
}

CV Text:
${cvText.substring(0, 30000)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        temperature: 0.2
      }
    });

    const resultText = response.text;
    
    // Remove potential markdown code blocks if the model ignores the instruction
    const cleanedText = resultText.replace(/```json\n?|```\n?/g, '').trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error extracting CV data with Gemini:", error);
    throw new Error("Failed to extract CV data.");
  }
};

module.exports = {
  extractCVData
};
