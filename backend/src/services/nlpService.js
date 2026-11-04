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
    "JavaScript", "TypeScript", "React", "React Native", "Next.js", "Vue.js", "Angular", "Svelte",
    "Node.js", "Express.js", "NestJS", "FastAPI", "Django", "Flask", "Spring Boot", "Ruby on Rails",
    "Python", "Java", "C++", "C#", ".NET", "PHP", "Laravel", "Go", "Rust", "Swift", "Kotlin", "Dart", "Flutter",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Prisma", "TypeORM", "GraphQL", "REST API",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Ansible", "CI/CD", "Jenkins", "GitHub Actions",
    "Git", "GitHub", "GitLab", "Linux", "Nginx", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "LLMs", "Generative AI", "PyTorch", "TensorFlow", "Pandas", "NumPy",
    "Jest", "Cypress", "Playwright", "Selenium", "Postman", "Figma", "Jira", "Microservices", "Serverless", "Kafka"
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
  const dateRegex = /((?:(?:from|dates?|duration|period|since)\s*[:|\-–—]?\s*)?(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s*)?(?:20\d{2}|19\d{2}|\d{1,2}[\./\-]\d{2,4})(?:[\./\-]\d{1,2})?(?:\s*(?:[-–—~]|to|till|until|\/)\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s*)?(?:20\d{2}|19\d{2}|\d{1,2}[\./\-]\d{2,4}|present|current|now|ongoing|till\s*date|to\s*date|expected)(?:[\./\-]\d{1,2})?)?(?:\s*\(\s*\d+\s*(?:yrs?|years?|mos?|months?)[^)]*\))?)/i;

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
      if (education.length >= 6) break;
    }
  }

  // Extract experience fallback
  const experience = [];
  const expLines = [];
  let inExpSection = false;
  for (const line of lines) {
    if (/^(?:work\s+experience|professional\s+experience|employment\s+history|employment\s+record|work\s+history|working\s+experience|experience|career\s+history|career\s+background|professional\s+background|internships?|internship\s+experience|practical\s+experience|industry\s+experience|relevant\s+(?:work\s+|professional\s+)?experience|positions?\s+held|employment|job\s+history|work\s+summary|career\s+summary)\b/i.test(line)) {
      inExpSection = true;
      continue;
    }
    if (inExpSection) {
      if (/^(?:education|academic|projects|skills|certifications|languages?|references?|awards|publications|volunteering)\b/i.test(line)) {
        break;
      }
      expLines.push(line);
    }
  }

  const roleRegex = /\b(software\s+engineer|software\s+developer|engineer(?:ing)?|developer|designer|manager|architect|analyst|lead|intern|internship|specialist|consultant|administrator|officer|director|associate|scientist|programmer|technician|trainee|full\s*stack|frontend|front-end|backend|back-end|devops|devsecops|sre|qa|tester|automation|scrum\s*master|product\s*owner|cto|ceo|cio|coo|cfo|vp|head\s+of|sysadmin|coordinator|solutions?\s*architect)\b/i;
  const companyRegex = /\b(inc\.?|llc|ltd\.?|\(pvt\)\s*ltd\.?|pvt\.?\s*ltd\.?|private\s+limited|technologies|technology|solutions|systems|system|labs?|software|innovations?|studios?|agency|digital|ventures?|consulting|analytics|networks?|media|partners?|holdings?|services?|group|enterprises?|global|interactive|security|cloud|fintech|bank|corporation|corp|google|microsoft|amazon|aws|meta|facebook|apple|netflix|uber|airbnb|wso2|sysco|virtusa|ifs|dialog|millenniumit|codegen|99x|pearson|zone24x7|mitra|octave|lseg|accenture|cognizant|infosys|tcs|deloitte|pwc|ey|kpmg|atlassian|shopify|calcey|rootcode)\b/i;
  const actionVerbRegex = /^(?:developed|engineered|implemented|built|designed|led|architected|created|maintained|collaborated|managed|automated|optimized|resolved|contributed|responsible|assisted|conducted|facilitated|spearheaded|delivered|configured|deployed|integrated|researched|analyzed|tested|documented|reported|mentored|supervised|trained|performed|monitored|established|improved|executed|prepared|provided|participated|supported|coordinated|handled|worked|guided|oversaw|ensured|drove|partnered|authored|reviewed|streamlined|achieved|utilized|used)\b/i;
  const expTargetLines = expLines;
  const projectDisqualifierRegex = /\b(?:projects?|personal\s+projects?|academic\s+projects?|college\s+projects?|final\s+year|capstone|coursework|mini\s+projects?|major\s+projects?|independent\s+projects?|github|portfolio)\b/i;
  const certDisqualifierRegex = /\b(?:certifications?|certificates?|certified|credentials?|licenses?|licence|coursera|udemy|edx|udacity|linkedin\s+learning|scrum\s+alliance|pmi|comptia|ccna|ccnp|cka|ckad|pmp|csm|psm|aws\s+certified|azure\s+certified|gcp\s+certified|credential\s*id|license\s*(?:no|number|#)|issued\s+[a-z]{3,9}\s+\d{4}|expires\s+[a-z]{3,9}\s+\d{4})\b/i;

  const isValidJob = (exp) => {
    if (!exp) return false;
    const titleClean = (exp.title || "").trim();
    const compClean = (exp.company || "").trim();
    const descClean = (exp.description || "").trim();
    if (projectDisqualifierRegex.test(titleClean) || projectDisqualifierRegex.test(compClean) || projectDisqualifierRegex.test(descClean)) return false;
    if (certDisqualifierRegex.test(titleClean) || certDisqualifierRegex.test(compClean) || certDisqualifierRegex.test(descClean)) return false;
    if (titleClean.toLowerCase().startsWith("project:") || titleClean.toLowerCase().startsWith("project name:")) return false;
    if (/^(?:certificate|certification|certified|license|licence|credential|course)\b/i.test(titleClean)) return false;
    if (/^(?:certificate|certification|certified|license|licence|credential|online\s+course)\b/i.test(compClean)) return false;

    const hasRealTitle = titleClean && titleClean !== "Professional Role";
    const hasRealComp = compClean && compClean !== "Company";
    return Boolean(hasRealTitle && hasRealComp);
  };

  let currentExp = null;
  for (let i = 0; i < expTargetLines.length; i++) {
    const l = expTargetLines[i].trim();
    if (!l) continue;

    const isBullet = /^(?:[•\-\*–—\>·◦\u2022\u25cf\u25cb\u25aa\u25ab]+|\d{1,2}[\.\)]\s+)\s*/.test(l);
    const cleanL = l.replace(/^(?:[•\-\*–—\>·◦\u2022\u25cf\u25cb\u25aa\u25ab]+|\d{1,2}[\.\)]\s+)\s*/, '').trim();

    // Skip certifications, licenses, and projects inside experience
    if (certDisqualifierRegex.test(cleanL) || projectDisqualifierRegex.test(cleanL) || /^(?:credential\s*id|license\s*(?:no|number|#)|issued\s+[a-z]{3,9}\s+\d{4}|expires\s+[a-z]{3,9}\s+\d{4})/i.test(cleanL)) {
      continue;
    }

    const dtMatch = l.match(dateRegex);
    const extractedDate = dtMatch ? dtMatch[0].trim() : null;
    let lineNoDate = extractedDate ? l.replace(dtMatch[0], '') : l;
    lineNoDate = lineNoDate.replace(/\(\s*\)/g, '').replace(/[|•,–-]$/, '').trim();

    if (isBullet && currentExp) {
      currentExp.description = currentExp.description ? `${currentExp.description}\n${cleanL}` : cleanL;
      continue;
    }

    // Skip education degree or school lines from experience
    if (degreeRegex.test(lineNoDate) || schoolRegex.test(lineNoDate)) {
      continue;
    }

    // Date-only line (e.g. "March 2021 - Present" on its own line)
    if (extractedDate && lineNoDate.length < 5) {
      if (currentExp && currentExp.period === "Unknown") {
        currentExp.period = extractedDate;
      }
      continue;
    }

    const hasRole = roleRegex.test(lineNoDate) && lineNoDate.length < 85;
    const hasComp = companyRegex.test(lineNoDate) && lineNoDate.length < 85;

    if (hasRole || (hasComp && (!currentExp || currentExp.company === "Company"))) {
      let title = "Professional Role";
      let comp = "Company";

      const parts = lineNoDate.split(/[-–—|•·]|(?:\bat\b)|@/i).map(p => p.trim()).filter(Boolean);
      if (parts.length < 2 && lineNoDate.includes(',')) {
        const commaParts = lineNoDate.split(',').map(p => p.trim()).filter(Boolean);
        if (commaParts.length >= 2 && (roleRegex.test(commaParts[0]) || roleRegex.test(commaParts[1]) || companyRegex.test(commaParts[0]) || companyRegex.test(commaParts[1]))) {
          parts.push(...commaParts);
        }
      }

      if (parts.length >= 2) {
        if (roleRegex.test(parts[0])) {
          title = parts[0];
          comp = parts[1];
        } else if (roleRegex.test(parts[1])) {
          comp = parts[0];
          title = parts[1];
        } else {
          title = parts[0];
          comp = parts[1];
        }

        if (comp.includes('|')) comp = comp.split('|')[0].trim();
        comp = comp.replace(/^(?:at|@|company|organization|employer)\s*[:|\-–—]?\s*/i, '').trim();

        if (isValidJob(currentExp)) {
          experience.push(currentExp);
          currentExp = null;
        }

        currentExp = {
          title: title || "Professional Role",
          company: comp || "Company",
          period: extractedDate || "Unknown",
          description: ""
        };
        if (experience.length >= 10) break;
        continue;
      }

      // Single item (either role or company on this line)
      if (hasRole) {
        if (isValidJob(currentExp)) {
          experience.push(currentExp);
          currentExp = null;
        }

        if (currentExp && currentExp.company === "Company" && currentExp.title !== "Professional Role" && !currentExp.description) {
          // Previous line was likely the company name
          comp = currentExp.title;
          if (comp.includes('|')) comp = comp.split('|')[0].trim();
          comp = comp.replace(/^(?:at|@|company|organization|employer)\s*[:|\-–—]?\s*/i, '').trim();
          title = lineNoDate;
          currentExp.title = title;
          currentExp.company = comp;
          if (extractedDate && currentExp.period === "Unknown") currentExp.period = extractedDate;
        } else if (!currentExp) {
          currentExp = {
            title: lineNoDate,
            company: "Company",
            period: extractedDate || "Unknown",
            description: ""
          };
          if (i + 1 < expTargetLines.length && companyRegex.test(expTargetLines[i + 1])) {
            let nextComp = expTargetLines[i + 1].replace(dateRegex, '').trim();
            if (nextComp.includes('|')) nextComp = nextComp.split('|')[0].trim();
            currentExp.company = nextComp.replace(/^(?:at|@|company|organization|employer)\s*[:|\-–—]?\s*/i, '').trim();
          } else if (i > 0 && companyRegex.test(expTargetLines[i - 1])) {
            let prevComp = expTargetLines[i - 1].replace(dateRegex, '').trim();
            if (prevComp.includes('|')) prevComp = prevComp.split('|')[0].trim();
            currentExp.company = prevComp.replace(/^(?:at|@|company|organization|employer)\s*[:|\-–—]?\s*/i, '').trim();
          }
        } else {
          currentExp.title = lineNoDate;
          if (extractedDate && currentExp.period === "Unknown") currentExp.period = extractedDate;
        }
      } else if (hasComp) {
        let cleanComp = lineNoDate;
        if (cleanComp.includes('|')) cleanComp = cleanComp.split('|')[0].trim();
        cleanComp = cleanComp.replace(/^(?:at|@|company|organization|employer)\s*[:|\-–—]?\s*/i, '').trim();

        if (!currentExp) {
          currentExp = {
            title: "Professional Role",
            company: cleanComp,
            period: extractedDate || "Unknown",
            description: ""
          };
        } else if (currentExp.company === "Company") {
          currentExp.company = cleanComp;
          if (extractedDate && currentExp.period === "Unknown") currentExp.period = extractedDate;
        }
      }

      if (experience.length >= 10) break;
    } else if (currentExp && !isBullet && cleanL.length > 0) {
      if (actionVerbRegex.test(cleanL) || cleanL.length > 50) {
        currentExp.description = currentExp.description ? `${currentExp.description}\n${cleanL}` : cleanL;
      }
    }
  }

  if (isValidJob(currentExp)) {
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
 * Converts a PDF buffer into structured JSON via the NLP microservice.
 * @param {Buffer} pdfBuffer
 * @returns {Promise<Object>} JSON layout representation of the PDF
 */
const convertPdfToJson = async (pdfBuffer) => {
  try {
    const base64Data = pdfBuffer.toString('base64');
    const response = await fetch(`${NLP_SERVICE_URL}/convert-to-json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pdf_base64: base64Data }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`NLP convert-to-json responded with status ${response.status}: ${errText}`);
      return { pages: [], annotations: [], metadata: { total_pages: 0 } };
    }

    const result = await response.json();
    return result.json || { pages: [], annotations: [], metadata: { total_pages: 0 } };
  } catch (error) {
    console.warn("Warning converting PDF to JSON with NLP Service:", error.message);
    return { pages: [], annotations: [], metadata: { total_pages: 0 } };
  }
};

/**
 * Extracts CV candidate data from a pre-converted JSON document.
 * @param {Object|string} jsonData
 * @param {string} [filename]
 * @returns {Promise<Object>}
 */
const extractCVDataFromJson = async (jsonData, filename = "") => {
  try {
    const payloadJson = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    const response = await fetch(`${NLP_SERVICE_URL}/extract-from-json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ json: payloadJson, filename }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`NLP extract-from-json responded with status ${response.status}: ${errText}`);
      return localExtractFallback(typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData), filename);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("Warning extracting CV data from JSON with NLP Service:", error.message);
    return localExtractFallback(typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData), filename);
  }
};

/**
 * End-to-end CV extraction directly from PDF buffer.
 * Performs conversion from PDF to JSON and candidate extraction in a single optimized call.
 * @param {Buffer} pdfBuffer
 * @param {string} [filename]
 * @returns {Promise<Object>} Extracted candidate fields plus the generated JSON
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
        json: result.json || null
      };
    }
  } catch (err) {
    console.warn("[nlpService] /extract-pdf endpoint failed, falling back to multi-step JSON:", err.message);
  }

  // Fallback: convert to JSON then extract
  const json = await convertPdfToJson(pdfBuffer);
  const data = await extractCVDataFromJson(json, filename);
  return { ...data, json };
};

/**
 * Universal extraction method for backward compatibility.
 * Accepts a PDF Buffer, JSON object, JSON string, or raw text string.
 * @param {Buffer|Object|string} input
 * @param {string} [filename]
 * @returns {Promise<Object>}
 */
const extractCVData = async (input, filename = "") => {
  try {
    // If input is a Buffer, convert PDF to JSON first and extract
    if (Buffer.isBuffer(input)) {
      return await extractCVDataFromPdf(input, filename);
    }

    // If input is already an object (JSON)
    if (typeof input === 'object' && input !== null) {
      return await extractCVDataFromJson(input, filename);
    }

    // If input is a string
    if (typeof input === 'string') {
      const trimmed = input.trim();
      // If it looks like a JSON string representation
      if (trimmed.startsWith('{') && (trimmed.includes('"pages"') || trimmed.includes('"text_blocks"'))) {
        try {
          const parsed = JSON.parse(trimmed);
          return await extractCVDataFromJson(parsed, filename);
        } catch (e) {
          // fall through to text extraction
        }
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

/**
 * Legacy backwards compatibility wrappers
 */
const convertPdfToXml = async (pdfBuffer) => {
  const json = await convertPdfToJson(pdfBuffer);
  return JSON.stringify(json);
};

const extractCVDataFromXml = async (xmlString, filename = "") => {
  return await extractCVData(xmlString, filename);
};

module.exports = {
  convertPdfToJson,
  extractCVDataFromJson,
  extractCVDataFromPdf,
  extractCVData,
  localExtractFallback,
  convertPdfToXml,
  extractCVDataFromXml
};
