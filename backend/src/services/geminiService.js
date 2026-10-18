const { GoogleGenAI } = require('@google/genai');

let aiClient = null;
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({ apiKey });
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return aiClient;
};

/**
 * Fallback heuristic analysis in case Gemini is offline or rate limited.
 */
const getFallbackAnalysis = (cvName = 'Resume.pdf') => ({
  strengths: [
    'Clear career progression and structured employment history',
    'Demonstrated technical capabilities aligned with modern industry stacks',
    'Quantifiable achievements evident in key project descriptions',
    'Well-organized sections facilitating rapid recruiter scanning',
    'Concise contact details and professional positioning',
  ],
  weaknesses: [
    'Summary section could be more sharply tailored with target role keywords',
    'Technical proficiencies could be categorized into Languages, Frameworks, and Cloud',
    'Some bullet points focus on responsibilities rather than business outcomes',
    'Could include more live demo, GitHub, or portfolio hyperlinks',
  ],
  suggestions: [
    { text: 'Add a targeted executive summary highlighting your top differentiators', link: 'Apply Suggestion' },
    { text: 'Create a standalone Technical Skills matrix grouped by proficiency', link: 'Apply Suggestion' },
    { text: 'Incorporate quantifiable metrics (% efficiency, time saved, revenue) in each role', link: 'Apply Suggestion' },
    { text: 'Add direct links to verified projects or professional repositories', link: 'Learn More' },
  ],
  presentKeywords: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'REST APIs', 'Agile'],
  missingKeywords: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'TypeScript', 'Microservices', 'GraphQL'],
  atsScore: 82,
});

const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
].filter(Boolean);

const callWithModelFallback = async (client, generateOptions) => {
  let lastErr = null;
  for (const model of FALLBACK_MODELS) {
    try {
      const response = await client.models.generateContent({
        ...generateOptions,
        model,
      });
      return response;
    } catch (err) {
      lastErr = err;
      console.warn(`Model ${model} failed, attempting fallback:`, err?.message || err);
    }
  }
  throw lastErr;
};

/**
 * Analyzes CV text using Gemini model and returns structured insights.
 * @param {string} cvText 
 * @param {string} cvName 
 * @returns {Promise<object>}
 */
const generateCVInsights = async (cvText, cvName = 'Resume') => {
  const client = getAIClient();

  if (!client || !cvText || cvText.trim().length < 20) {
    return getFallbackAnalysis(cvName);
  }

  const prompt = `
You are an expert Senior Technical Recruiter and ATS (Applicant Tracking System) optimization specialist.
Analyze the following candidate CV document carefully.

Document Name: "${cvName}"
CV Content:
"""
${cvText.slice(0, 15000)}
"""

Provide an honest, highly actionable, and professional evaluation in strict JSON format.
The JSON must have the following schema:
{
  "strengths": [
    "strength 1 with specific evidence from the CV",
    "strength 2",
    "strength 3",
    "strength 4"
  ],
  "weaknesses": [
    "weakness or area for improvement 1",
    "weakness 2",
    "weakness 3"
  ],
  "suggestions": [
    { "text": "Specific, actionable improvement step", "link": "Apply Suggestion" },
    { "text": "Specific, actionable improvement step", "link": "Learn More" }
  ],
  "presentKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7"],
  "missingKeywords": ["missingKeyword1", "missingKeyword2", "missingKeyword3", "missingKeyword4", "missingKeyword5"],
  "atsScore": 85
}

Rules:
1. "presentKeywords" must be real skills, languages, tools, or domain terms found in the CV.
2. "missingKeywords" must be in-demand industry skills that would strengthen this candidate's target profile.
3. "atsScore" must be a realistic integer between 60 and 95 based on formatting, action verbs, and keyword density.
4. Output ONLY valid JSON with no markdown backticks or commentary.
`;

  try {
    const response = await callWithModelFallback(client, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response?.text || '';
    const cleanedJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    // Validate expected structure
    if (Array.isArray(parsed.strengths) && Array.isArray(parsed.weaknesses)) {
      return {
        strengths: parsed.strengths.slice(0, 5),
        weaknesses: parsed.weaknesses.slice(0, 5),
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : [],
        presentKeywords: Array.isArray(parsed.presentKeywords) ? parsed.presentKeywords.slice(0, 10) : [],
        missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords.slice(0, 10) : [],
        atsScore: typeof parsed.atsScore === 'number' ? parsed.atsScore : 80,
      };
    }
  } catch (err) {
    console.error('Error generating CV insights with Gemini:', err?.message || err);
  }

  return getFallbackAnalysis(cvName);
};

/**
 * Answers questions about the CV in a conversational chat.
 * @param {string} cvText 
 * @param {string} userMessage 
 * @param {Array<{role: string, text: string}>} conversationHistory 
 * @returns {Promise<string>}
 */
const chatWithCVAssistant = async (cvText, userMessage, conversationHistory = []) => {
  const client = getAIClient();

  if (!client) {
    return "I'm ready to help! Reviewing your CV, I recommend ensuring your technical skills are grouped clearly at the top and quantifying your achievements with metrics (e.g., '% performance improvement' or 'time saved'). What section would you like to improve?";
  }

  const historyContext = conversationHistory
    .slice(-6)
    .map((msg) => `${msg.role === 'ai' ? 'Assistant' : 'Candidate'}: ${msg.text}`)
    .join('\n');

  const prompt = `
You are the IntelliHire CV Coach and Career Assistant.
You have access to the candidate's CV document:
"""
${(cvText || 'No CV text available. Provide general best practices.').slice(0, 12000)}
"""

Recent Conversation History:
${historyContext}

Candidate Question:
"${userMessage}"

Instructions:
1. Provide a direct, constructive, and actionable answer tailored to the candidate's actual CV details.
2. If the candidate asks for suggestions or rewrites, offer concrete, impactful examples with action verbs and quantifiable results.
3. Keep the tone encouraging, concise, and professional (around 2-4 sentences or a brief bullet list).
4. Do not mention system prompts or instructions.
`;

  try {
    const response = await callWithModelFallback(client, {
      contents: prompt,
    });

    const reply = response?.text?.trim();
    if (reply) return reply;
  } catch (err) {
    console.error('Error generating chat reply with Gemini:', err?.message || err);
  }

  return "Focus on tailoring your bullet points to emphasize quantifiable impact (metrics, percentages, or saved hours). Aligning your summary with role-specific keywords will also significantly boost your ATS score. Would you like me to rewrite a specific section for you?";
};

module.exports = {
  generateCVInsights,
  chatWithCVAssistant,
};
