const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || "http://nlp:5001";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const redactContactDetails = (value, identifiers) => {
  let text = value;
  for (const identifier of identifiers) {
    if (typeof identifier === "string" && identifier.trim().length >= 3) {
      text = text.replace(new RegExp(escapeRegex(identifier.trim()), "gi"), "[redacted]");
    }
  }
  return text
    .replace(/[A-Z0-9._%+-]+\s*@\s*[A-Z0-9.-]+\s*\.\s*[A-Z]{2,}/gi, "[email redacted]")
    .replace(/(?:https?:\/\/|www\.)[^\s<>"']+|(?:linkedin|github)\.com\/[^\s<>"']+/gi, "[link redacted]")
    .replace(/(?:\+?\d[\d \t().-]{7,}\d)/g, (match) =>
      /^(?:19|20)\d{2}\s*-\s*(?:19|20)\d{2}$/.test(match) ? match : "[phone redacted]"
    );
};

const sanitizeValue = (value, identifiers) => {
  if (typeof value === "string") return redactContactDetails(value, identifiers);
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item, identifiers));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeValue(item, identifiers)])
    );
  }
  return value;
};

const buildCVInsightsInput = async (cvText, candidate, chat = null) => {
  if (typeof cvText !== "string" || cvText.trim().length < 20) {
    const error = new Error("Not enough readable CV text to generate insights.");
    error.status = 422;
    throw error;
  }

  const response = await fetch(`${NLP_SERVICE_URL}/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: cvText }),
  });
  if (!response.ok) {
    const error = new Error("CV extraction service is unavailable.");
    error.status = 503;
    throw error;
  }

  const extracted = await response.json();
  if (!extracted || typeof extracted !== "object" || Array.isArray(extracted)) {
    throw new Error("CV extraction service returned an invalid response.");
  }
  const identifiers = [
    candidate.name, candidate.email, candidate.phone, candidate.location,
    extracted.name, extracted.email, extracted.phone, extracted.location,
    extracted.linkedin, extracted.github,
  ];
  const structured = {
    headline: extracted.headline,
    bio: extracted.bio,
    skills: Array.isArray(extracted.skills) ? extracted.skills : [],
    experience: Array.isArray(extracted.experience)
      ? extracted.experience.filter((item) => item && typeof item === "object")
        .map(({ title, company, period, description }) => ({ title, company, period, description }))
      : [],
    education: Array.isArray(extracted.education)
      ? extracted.education.filter((item) => item && typeof item === "object")
        .map(({ title, school, period }) => ({ title, school, period }))
      : [],
  };
  const input = {
    structured: sanitizeValue(structured, identifiers),
    text: redactContactDetails(cvText, identifiers).slice(0, 15000),
  };
  if (chat) {
    input.chat = sanitizeValue(chat, identifiers);
  }
  return input;
};

module.exports = { buildCVInsightsInput };
