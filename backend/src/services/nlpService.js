const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://nlp:5001';

/**
 * Local in-process fallback extractor using regex heuristics.
 * Guarantees that CV data extraction never crashes or returns 500,
 * even if the NLP microservice is temporarily unreachable or the PDF has limited text.
 */
const localExtractFallback = (text, filename = "") => {
  const cleanText = text || "";

  // Extract email
  let email = null;
  const emailMatch = cleanText.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/);
  if (emailMatch) email = emailMatch[0];

  // Extract phone
  let phone = null;
  const phoneMatch = cleanText.match(/(?:(?:\+\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4})|(?:0\d{2}[\s-]?\d{3}[\s-]?\d{4})/);
  if (phoneMatch) phone = phoneMatch[0].trim();

  // Extract name
  let name = null;
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const nameBlacklist = ["curriculum", "vitae", "resume", "cv", "profile", "summary", "experience", "education", "skills", "projects", "contact"];
  for (const line of lines.slice(0, 6)) {
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && !/[0-9@/:;]/.test(line)) {
      if (!nameBlacklist.some(b => line.toLowerCase().includes(b))) {
        name = line.replace(/,\s*(?:Ph\.?D\.?|M\.?Sc\.?|B\.?Sc\.?|MBA|PMP)$/i, '').trim();
        break;
      }
    }
  }

  // Fallback name from filename
  if (!name && filename) {
    const cleanFile = filename.replace(/\.pdf$/i, '').replace(/[-_](?:cv|resume|devops|intern|fullstack|se|backend|frontend).*$/i, '');
    const tokens = cleanFile.split(/[-_\s]+/).filter(t => t && !/^\d+$/.test(t) && !nameBlacklist.includes(t.toLowerCase()));
    if (tokens.length >= 2 && tokens.length <= 4) {
      name = tokens.map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).join(' ');
    }
  }

  // Extract skills from text
  const skills = [];
  const commonTech = [
    "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C++", "C#",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "AWS", "Docker", "Kubernetes",
    "CI/CD", "Git", "GitHub", "Linux", "HTML5", "CSS3", "Tailwind CSS", "Express.js",
    "Next.js", "Spring Boot", "FastAPI", "GraphQL", "REST API", "Figma", "Postman",
    "Microservices", "Terraform", "Ansible", "Vite", "Webpack", "Jest"
  ];
  const textLower = cleanText.toLowerCase();
  for (const tech of commonTech) {
    const techLower = tech.toLowerCase();
    const regex = new RegExp(`\\b${techLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(textLower)) {
      skills.push(tech);
    }
  }

  // Extract location
  let location = null;
  const locMatch = cleanText.match(/\b(Colombo,\s*Sri Lanka|San Francisco,\s*CA|Boston,\s*MA|New York,\s*NY|London,\s*UK|Toronto,\s*Canada|Sydney,\s*Australia|Singapore|Sri Lanka)\b/i);
  if (locMatch) location = locMatch[0];

  // Extract headline
  let headline = null;
  if (lines.length > 1) {
    for (const line of lines.slice(1, 6)) {
      if (/(?:engineer|developer|designer|manager|architect|analyst|scientist|intern|consultant)/i.test(line) && line.length < 65 && !line.includes('@')) {
        headline = line;
        break;
      }
    }
  }

  // Extract LinkedIn & GitHub (with annotation URIs and spaced-domain normalization)
  let normalizedText = cleanText
    .replace(/linkedin\s*\.\s*com\s*(?:\/\s*(?:in|profile|pub))?\s*\/\s*/gi, 'linkedin.com/in/')
    .replace(/github\s*\.\s*com\s*\/\s*/gi, 'github.com/');

  const uriMatches = (cleanText.match(/\/URI\s*\(([^)]+)\)|href=["']([^"']+)["']/gi) || []).map(u => u.replace(/^href=["']|["']$|^\/URI\s*\(|\)$/gi, ''));
  if (uriMatches.length > 0) {
    normalizedText = uriMatches.join(' ') + ' ' + normalizedText;
  }

  let linkedin = null;
  const liMatch = normalizedText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in\/|profile\/|pub\/)?([a-zA-Z0-9_.-]+)/i);
  if (liMatch && !['in', 'profile', 'pub'].includes(liMatch[1].toLowerCase())) {
    linkedin = `https://linkedin.com/in/${liMatch[1].replace(/[/.,)]+$/, '')}`;
  } else {
    const liLabel = normalizedText.match(/\b(?:linkedin|linked-in)\s*(?:profile|account|url)?\s*[:|•\-–/]\s*(?:\/in\/|in\/)?([a-zA-Z0-9_.-]+)/i);
    if (liLabel && !['in', 'profile', 'pub', 'http', 'https', 'www'].includes(liLabel[1].toLowerCase())) {
      linkedin = `https://linkedin.com/in/${liLabel[1].replace(/[/.,)]+$/, '')}`;
    }
  }

  let github = null;
  const ghMatch = normalizedText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)/i);
  if (ghMatch && !['profile', 'user', 'in', 'about', 'repositories', 'tab'].includes(ghMatch[1].toLowerCase())) {
    github = `https://github.com/${ghMatch[1].replace(/[/.,)]+$/, '')}`;
  } else {
    const ghLabel = normalizedText.match(/\b(?:github|git-hub)\s*(?:profile|account|url)?\s*[:|•\-–/]\s*([a-zA-Z0-9_.-]+)/i);
    if (ghLabel && !['profile', 'user', 'http', 'https', 'www'].includes(ghLabel[1].toLowerCase())) {
      github = `https://github.com/${ghLabel[1].replace(/[/.,)]+$/, '')}`;
    }
  }

  // Extract education fallback
  const education = [];
  const eduLines = [];
  let inEduSection = false;
  for (const line of lines) {
    if (/^(?:education|academic\s+qualifications?|educational\s+background|qualifications)\b/i.test(line)) {
      inEduSection = true;
      continue;
    }
    if (inEduSection) {
      if (/^(?:experience|work\s+experience|projects|skills|certifications|contact|summary|profile)\b/i.test(line)) {
        break;
      }
      eduLines.push(line);
    }
  }

  const degreeRegex = /\b(bachelor|master|doctor|bsc|b\.sc|beng|b\.eng|btech|b\.tech|msc|m\.sc|phd|diploma|higher\s+national\s+diploma|hnd|g\.?c\.?e|a\/l|o\/l|high\s+school)\b/i;
  const schoolRegex = /\b(university|institute|college|school|campus|academy|polytechnic|faculty|sliit|nsbm|nibm|iit|icbt|mit|stanford|harvard)\b/i;
  const dateRegex = /((?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(?:20\d{2}|19\d{2})\s*(?:[-–to/]+\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(?:20\d{2}|19\d{2}|present|current|expected))?)/i;

  const targetLines = eduLines.length > 0 ? eduLines : lines;
  for (let i = 0; i < targetLines.length; i++) {
    const l = targetLines[i];
    if (degreeRegex.test(l)) {
      const dtMatch = l.match(dateRegex);
      const period = dtMatch ? dtMatch[0].trim() : "Unknown";
      let title = l.replace(dateRegex, '').replace(/[|•,–-]$/, '').trim();
      let school = "Institution";

      if (i + 1 < targetLines.length && schoolRegex.test(targetLines[i + 1])) {
        school = targetLines[i + 1].replace(dateRegex, '').trim();
      } else if (i > 0 && schoolRegex.test(targetLines[i - 1])) {
        school = targetLines[i - 1].replace(dateRegex, '').trim();
      } else if (schoolRegex.test(l)) {
        const parts = l.split(/[-–|•@]/);
        if (parts.length >= 2) {
          if (degreeRegex.test(parts[0])) {
            title = parts[0].trim();
            school = parts[1].trim();
          } else {
            school = parts[0].trim();
            title = parts[1].trim();
          }
        }
      }

      education.push({
        title: title || "Degree/Program",
        school: school || "Institution",
        period: period
      });
      if (education.length >= 4) break;
    }
  }

  // Extract experience fallback
  const experience = [];
  const expLines = [];
  let inExpSection = false;
  for (const line of lines) {
    if (/^(?:work\s+experience|professional\s+experience|employment\s+history|experience|career\s+history|internships?)\b/i.test(line)) {
      inExpSection = true;
      continue;
    }
    if (inExpSection) {
      if (/^(?:education|academic|projects|skills|certifications|languages?|references?)\b/i.test(line)) {
        break;
      }
      expLines.push(line);
    }
  }

  const roleRegex = /\b(engineer|developer|designer|manager|architect|analyst|lead|intern|specialist|consultant|administrator|officer|director|associate|scientist|programmer|technician|trainee)\b/i;
  const companyRegex = /\b(inc|llc|ltd|\(pvt\)\s*ltd|pvt\s*ltd|technologies|solutions|systems|labs?|software|corp|bank|group|google|microsoft|wso2|sysco|virtusa|ifs|dialog|99x|amazon|meta|apple)\b/i;
  const expTargetLines = expLines.length > 0 ? expLines : lines;

  let currentExp = null;
  for (let i = 0; i < expTargetLines.length; i++) {
    const l = expTargetLines[i].trim();
    if (!l) continue;

    const isBullet = /^[•\-\*–—\>·◦\d+\.]\s*/.test(l);
    const cleanL = l.replace(/^[•\-\*–—\>·◦\d+\.]\s*/, '').trim();
    const dtMatch = l.match(dateRegex);
    const extractedDate = dtMatch ? dtMatch[0].trim() : null;
    const lineNoDate = extractedDate ? l.replace(dtMatch[0], '').replace(/[|•,–-]$/, '').trim() : l;

    if (isBullet && currentExp) {
      currentExp.description = currentExp.description ? `${currentExp.description}\n${cleanL}` : cleanL;
      continue;
    }

    if (roleRegex.test(lineNoDate) && lineNoDate.length < 80) {
      if (currentExp && (currentExp.title !== "Professional Role" || currentExp.description)) {
        experience.push(currentExp);
        currentExp = null;
      }

      let title = lineNoDate;
      let comp = "Company";

      const parts = lineNoDate.split(/[-–|•@]|(?:\bat\b)/i);
      if (parts.length >= 2) {
        if (roleRegex.test(parts[0])) {
          title = parts[0].trim();
          comp = parts[1].trim();
        } else {
          comp = parts[0].trim();
          title = parts[1].trim();
        }
      } else if (i + 1 < expTargetLines.length && companyRegex.test(expTargetLines[i + 1])) {
        comp = expTargetLines[i + 1].replace(dateRegex, '').trim();
      } else if (i > 0 && companyRegex.test(expTargetLines[i - 1])) {
        comp = expTargetLines[i - 1].replace(dateRegex, '').trim();
      }

      currentExp = {
        title: title || "Professional Role",
        company: comp || "Company",
        period: extractedDate || "Unknown",
        description: ""
      };
      if (experience.length >= 5) break;
    } else if (currentExp && !isBullet && cleanL.length > 0) {
      if (/^(?:developed|engineered|built|led|designed|implemented|maintained|managed|collaborated|responsible)\b/i.test(cleanL) || cleanL.length > 50) {
        currentExp.description = currentExp.description ? `${currentExp.description}\n${cleanL}` : cleanL;
      }
    }
  }

  if (currentExp && (currentExp.title !== "Professional Role" || currentExp.description)) {
    experience.push(currentExp);
  }

  return {
    name: name || null,
    email: email || null,
    phone: phone || null,
    location: location || null,
    headline: headline || (name ? "Candidate" : null),
    bio: null,
    language: "English",
    skills,
    education,
    experience
  };
};

/**
 * Converts a PDF buffer into structured XML via the NLP microservice.
 * @param {Buffer} pdfBuffer
 * @returns {Promise<string>} XML string representation of the PDF
 */
const convertPdfToXml = async (pdfBuffer) => {
  try {
    const base64Data = pdfBuffer.toString('base64');
    const response = await fetch(`${NLP_SERVICE_URL}/convert-to-xml`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pdf_base64: base64Data }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`NLP convert-to-xml responded with status ${response.status}: ${errText}`);
      return '<?xml version="1.0" encoding="utf-8"?><pages></pages>';
    }

    const result = await response.json();
    return result.xml || '<?xml version="1.0" encoding="utf-8"?><pages></pages>';
  } catch (error) {
    console.warn("Warning converting PDF to XML with NLP Service:", error.message);
    return '<?xml version="1.0" encoding="utf-8"?><pages></pages>';
  }
};

/**
 * Extracts CV candidate data from a pre-converted XML string.
 * @param {string} xmlString
 * @param {string} [filename]
 * @returns {Promise<Object>}
 */
const extractCVDataFromXml = async (xmlString, filename = "") => {
  try {
    const response = await fetch(`${NLP_SERVICE_URL}/extract-from-xml`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ xml: xmlString, filename }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`NLP extract-from-xml responded with status ${response.status}: ${errText}`);
      return localExtractFallback(xmlString, filename);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("Warning extracting CV data from XML with NLP Service:", error.message);
    return localExtractFallback(xmlString, filename);
  }
};

/**
 * End-to-end CV extraction directly from PDF buffer.
 * Performs conversion and candidate extraction in a single optimized call.
 * @param {Buffer} pdfBuffer
 * @param {string} [filename]
 * @returns {Promise<Object>} Extracted candidate fields plus the generated XML
 */
const extractCVDataFromPdf = async (pdfBuffer, filename = "") => {
  try {
    const base64Data = pdfBuffer.toString('base64');
    const response = await fetch(`${NLP_SERVICE_URL}/extract-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pdf_base64: base64Data, filename }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        ...(result.data || {}),
        xml: result.xml || null
      };
    }
  } catch (err) {
    console.warn("[nlpService] /extract-pdf endpoint failed, falling back to multi-step:", err.message);
  }

  // Fallback: convert to XML then extract
  const xml = await convertPdfToXml(pdfBuffer);
  const data = await extractCVDataFromXml(xml, filename);
  return { ...data, xml };
};

/**
 * Universal extraction method for backward compatibility.
 * Accepts a PDF Buffer, XML string, or raw text string.
 * @param {Buffer|string} input
 * @param {string} [filename]
 * @returns {Promise<Object>}
 */
const extractCVData = async (input, filename = "") => {
  try {
    // If input is a Buffer, convert PDF to XML first and extract
    if (Buffer.isBuffer(input)) {
      return await extractCVDataFromPdf(input, filename);
    }

    // If input is an XML string
    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (trimmed.startsWith('<') && (trimmed.includes('<pages>') || trimmed.includes('<?xml') || trimmed.includes('<document>'))) {
        return await extractCVDataFromXml(trimmed, filename);
      }

      // Plain text string
      const response = await fetch(`${NLP_SERVICE_URL}/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input, filename }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      return localExtractFallback(input, filename);
    }

    return localExtractFallback("", filename);
  } catch (error) {
    console.warn("Warning in extractCVData, using fallback:", error.message);
    return localExtractFallback(typeof input === 'string' ? input : "", filename);
  }
};

module.exports = {
  convertPdfToXml,
  extractCVDataFromXml,
  extractCVDataFromPdf,
  extractCVData,
  localExtractFallback
};
