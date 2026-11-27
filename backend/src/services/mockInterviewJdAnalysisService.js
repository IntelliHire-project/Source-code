const geminiService = require('./geminiService');

const TECH_KEYWORDS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'HTML', 'HTML5', 'CSS', 'CSS3',
  'Tailwind CSS', 'Sass', 'SCSS', 'Redux', 'Webpack', 'Vite', 'React Native', 'Flutter',
  'Node.js', 'Express', 'NestJS', 'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot',
  'Go', 'Rust', 'C#', '.NET', 'PHP', 'Laravel', 'Ruby on Rails',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'Firebase', 'Supabase',
  'Prisma', 'Sequelize', 'SQLAlchemy', 'Hibernate', 'GraphQL', 'REST APIs', 'gRPC', 'WebSockets',
  'Microservices', 'System Design', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform',
  'CI/CD', 'GitHub Actions', 'Jenkins', 'Git', 'Linux', 'Nginx',
  'Jest', 'Cypress', 'Playwright', 'Selenium', 'Automated Testing', 'API Testing', 'Unit Testing', 'Integration Testing',
  'Test Planning', 'Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Accessibility',
  'Tableau', 'Power BI', 'Statistical Modeling', 'Data Visualization', 'Machine Learning', 'Deep Learning',
  'NLP', 'LLMs', 'Pandas', 'NumPy', 'PyTorch', 'TensorFlow', 'Scikit-Learn',
  'State Management', 'Web Performance', 'Kafka', 'RabbitMQ', 'OAuth2', 'JWT', 'Agile', 'Scrum', 'TDD', 'OOP',
];

const SOFT_SKILL_KEYWORDS = [
  { pattern: /\b(communicat\w*|articulation|present\w*)\b/i, label: 'Clear Technical Communication' },
  { pattern: /\b(collaborat\w*|cross-functional|teamwork)\b/i, label: 'Cross-Functional Collaboration' },
  { pattern: /\b(problem[- ]solv\w*|troubleshoot\w*|debug\w*|diagnos\w*)\b/i, label: 'Structured Problem Solving' },
  { pattern: /\b(leader\w*|mentor\w*|coach\w*|ownership)\b/i, label: 'Technical Leadership & Ownership' },
  { pattern: /\b(agile|scrum|sprint|stakeholder)\b/i, label: 'Agile & Stakeholder Alignment' },
  { pattern: /\b(trade-?off|architect\w*|scalab\w*|decision)\b/i, label: 'Architectural Trade-Off Analysis' },
];

const toStringArray = (value, maxItems = 10) => {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const result = [];
  for (const item of value) {
    const trimmed = typeof item === 'string' ? item.trim() : '';
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(trimmed);
      if (result.length >= maxItems) break;
    }
  }
  return result;
};

const normalizeDifficulty = (value) => {
  const lower = String(value || '').toLowerCase();
  if (lower === 'easy') return 'Easy';
  if (lower === 'hard') return 'Hard';
  return 'Medium';
};

const cleanBulletLine = (line = '') =>
  String(line)
    .replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, '')
    .replace(/^\*\*|\*\*$/g, '')
    .trim();

const isHeadingLine = (line = '') => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^#{1,4}\s+/.test(trimmed)) return true;
  if (/^\*\*[^*]+\*\*:?$/.test(trimmed)) return true;
  if (/^[A-Za-z][A-Za-z\s/&,-]{2,50}:$/.test(trimmed)) return true;
  return false;
};

const classifySectionHeading = (heading = '') => {
  const normalized = heading
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/:$/, '')
    .trim()
    .toLowerCase();

  if (/(responsibilit|duties|what you('ll|\s+will)\s+do|accountabilit|day[- ]to[- ]day)/i.test(normalized)) {
    return 'responsibilities';
  }
  if (/(experience|requirement|qualification|what we('re|\s+are)\s+looking for|who you are|must have|preferred|nice to have|education|background)/i.test(normalized)) {
    return 'experience';
  }
  if (/(skill|competenc|tech\s*stack|tools|technologies)/i.test(normalized)) {
    return 'skills';
  }
  return 'other';
};

/**
 * Splits a job description into classified sections so skills, responsibilities,
 * and experience requirements can be extracted with section awareness.
 */
const splitJobDescriptionSections = (text = '') => {
  const sections = {
    responsibilities: [],
    experience: [],
    skills: [],
    other: [],
  };

  let currentSection = 'other';
  const lines = String(text).split(/\r?\n/);

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    if (isHeadingLine(trimmed)) {
      currentSection = classifySectionHeading(trimmed);
      continue;
    }

    const cleaned = cleanBulletLine(trimmed);
    if (cleaned.length >= 3) {
      sections[currentSection].push(cleaned);
    }
  }

  return sections;
};

const detectSeniorityFromText = (text = '', detectedRole = '') => {
  const roleLower = String(detectedRole || '').toLowerCase();
  const lower = String(text || '').toLowerCase();

  const matchLevel = (target) => {
    if (/\b(principal|staff|distinguished)\b/.test(target)) return 'Principal';
    if (
      /\b(tech\s+lead|team\s+lead|engineering\s+lead|lead\s+(?:software\s+|frontend\s+|backend\s+|full[- ]?stack\s+|qa\s+|data\s+)?(?:engineer|developer|architect|designer|analyst)|software\s+architect|solutions?\s+architect|head\s+of|engineering\s+manager)\b/.test(
        target
      )
    ) {
      return 'Lead';
    }
    if (/\b(senior|sr\.?|5\+\s*years|6\+\s*years|7\+\s*years|8\+\s*years)\b/.test(target)) return 'Senior';
    if (/\b(junior|jr\.?|entry[- ]level|intern|graduate|0-2\s*years|1\+\s*year)\b/.test(target)) return 'Junior';
    return null;
  };

  return matchLevel(roleLower) || matchLevel(lower) || 'Mid-Level';
};

const extractYearsOfExperience = (text = '') => {
  const match = String(text).match(
    /\b(\d+\s*(?:\+|plus)?(?:\s*[-–to]+\s*\d+\+?)?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+(?:relevant|professional|industry|hands-on|practical|proven|related))?(?:\s+experience)?)/i
  );
  if (match && match[1]) {
    const raw = match[1].trim();
    const numMatch = raw.match(/\d+\s*(?:\+|plus)?(?:\s*[-–to]+\s*\d+\+?)?\s*(?:years?|yrs?)/i);
    return numMatch ? numMatch[0].replace(/\s+/g, ' ').trim() : raw;
  }
  return null;
};

const extractSkillsFromText = (text = '', roleSkills = [], sections = null) => {
  const lowerText = text.toLowerCase();
  const candidates = [...new Set([...(Array.isArray(roleSkills) ? roleSkills : []), ...TECH_KEYWORDS])];
  const matched = [];
  const seen = new Set();

  const addSkill = (skill) => {
    const clean = String(skill || '').trim();
    if (!clean || clean.length > 45) return;
    const key = clean.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      matched.push(clean);
    }
  };

  for (const skill of candidates) {
    if (!skill || typeof skill !== 'string') continue;
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (regex.test(lowerText)) {
      // Avoid matching generic "CSS" solely from "Tailwind CSS"
      if (skill.toLowerCase() === 'css') {
        const withoutTailwind = lowerText.replace(/tailwind\s+css/gi, '');
        if (!regex.test(withoutTailwind)) continue;
      }
      addSkill(skill);
    }
  }

  // Also extract explicitly tagged skills like "Required Skill: GraphQL" or short skill bullets
  const explicitLines = String(text).split(/\r?\n/);
  for (const rawLine of explicitLines) {
    const reqMatch = rawLine.match(/(?:required\s+skills?|technical\s+skills?|skills?)\s*:\s*(.+)$/i);
    if (reqMatch && reqMatch[1]) {
      reqMatch[1]
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 2 && s.length <= 40)
        .forEach(addSkill);
    }
  }

  if (sections && Array.isArray(sections.skills)) {
    for (const line of sections.skills) {
      if (line.length <= 40 && !/[.!?]$/.test(line)) {
        line
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter((s) => s.length >= 2 && s.length <= 35)
          .forEach(addSkill);
      }
    }
  }

  return matched.slice(0, 15);
};

const extractResponsibilitiesFromText = (text = '', sections = null) => {
  const parsedSections = sections || splitJobDescriptionSections(text);
  const candidates = [];

  if (parsedSections.responsibilities.length > 0) {
    for (const line of parsedSections.responsibilities) {
      if (line.length >= 15 && line.length <= 240) {
        candidates.push(line);
      }
    }
  }

  if (candidates.length < 3) {
    const fallbackLines = [...parsedSections.other]
      .filter(
        (line) =>
          line.length >= 20 &&
          line.length <= 240 &&
          !/^(?:track|mode|position|job title|role)\s*:/i.test(line) &&
          /\b(design|build|develop|architect|implement|maintain|collaborate|optimize|lead|test|analyze|deliver|drive|debug|manage|ensure|create|diagnose|own|review|deploy)\b/i.test(line)
      );
    for (const line of fallbackLines) {
      if (!candidates.some((c) => c.toLowerCase() === line.toLowerCase())) {
        candidates.push(line);
      }
    }
  }

  const unique = toStringArray(candidates, 6);
  return unique.length > 0
    ? unique
    : ['Deliver scalable, maintainable solutions aligned with role requirements and engineering standards.'];
};

const extractExperienceRequirementsFromText = (
  text = '',
  seniorityLevel = 'Mid-Level',
  technicalSkills = [],
  sections = null
) => {
  const parsedSections = sections || splitJobDescriptionSections(text);
  const expPattern =
    /\b(\d+\s*(?:\+|plus)?\s*(?:[-–to]+\s*\d+\s*)?(?:years?|yrs?)|experience(?:\s+(?:with|in|of|building|designing|leading|managing|developing|using))?|hands-on|proficiency|proficient|proven\s+track\s+record|solid\s+grounding|strong\s+understanding|familiarity\s+with|background\s+in|bachelor|master|phd|degree|diploma|certification|certified|equivalent\s+practical)\b/i;

  const candidates = [];

  for (const line of parsedSections.experience) {
    if (line.length >= 12 && line.length <= 240) {
      candidates.push(line);
    }
  }

  const allLines = String(text)
    .split(/\r?\n/)
    .map(cleanBulletLine)
    .filter((line) => line.length >= 15 && line.length <= 240 && !isHeadingLine(line));

  for (const line of allLines) {
    if (expPattern.test(line) && !candidates.some((c) => c.toLowerCase() === line.toLowerCase())) {
      candidates.push(line);
    }
  }

  const extracted = toStringArray(candidates, 6);
  if (extracted.length > 0) {
    return extracted;
  }

  const topSkills = technicalSkills.slice(0, 2).join(' and ') || 'core domain technologies';
  return [
    `${seniorityLevel}-level hands-on experience applying ${topSkills} in production environments.`,
    'Demonstrated experience breaking down ambiguous requirements and justifying technical trade-offs.',
  ];
};

const buildFallbackQuestions = (detectedRole, technicalSkills, focusAreas) => {
  const primarySkill = technicalSkills[0] || 'Core Engineering';
  const secondarySkill = technicalSkills[1] || technicalSkills[0] || 'System Design';
  const tertiarySkill = technicalSkills[2] || 'Debugging & Reliability';
  const focusTopic1 = focusAreas[0]?.topic || primarySkill;
  const focusTopic2 = focusAreas[1]?.topic || secondarySkill;

  return [
    {
      id: 1,
      number: 1,
      title: 'Question 1',
      topic: focusTopic1,
      difficulty: 'Easy',
      duration: '4 min',
      description: `Walk through how you have applied ${primarySkill} in a production project for a ${detectedRole} role. What core conventions and best practices do you follow?`,
      hint: `Anchor your answer in concrete ${primarySkill} decisions, measurable outcomes, and why those practices prevented regressions.`,
    },
    {
      id: 2,
      number: 2,
      title: 'Question 2',
      topic: focusTopic2,
      difficulty: 'Medium',
      duration: '6 min',
      description: `Design an end-to-end solution involving ${primarySkill} and ${secondarySkill} that meets the scalability and reliability goals described in this role. What trade-offs would you make?`,
      hint: `Compare at least two architectural approaches, explain bottlenecks around ${secondarySkill}, and justify your chosen trade-offs.`,
    },
    {
      id: 3,
      number: 3,
      title: 'Question 3',
      topic: tertiarySkill,
      difficulty: 'Medium',
      duration: '5 min',
      description: `Suppose a critical workflow using ${tertiarySkill} begins failing or degrading under peak usage. Walk through your step-by-step diagnostic and remediation plan.`,
      hint: 'Cover reproduction, telemetry/logging, root-cause isolation, safe rollback/mitigation, and long-term prevention.',
    },
    {
      id: 4,
      number: 4,
      title: 'Question 4',
      topic: 'Cross-Functional Collaboration & Delivery',
      difficulty: 'Medium',
      duration: '5 min',
      description: `Describe a time you had to align product stakeholders or engineers on a difficult technical trade-off relevant to ${detectedRole}. How did you communicate constraints and drive consensus?`,
      hint: 'Use the STAR structure (Situation, Task, Action, Result) and highlight objective metrics or risk mitigation.',
    },
    {
      id: 5,
      number: 5,
      title: 'Question 5',
      topic: 'Deep Architecture & Edge Cases',
      difficulty: 'Hard',
      duration: '8 min',
      description: `For a ${detectedRole} team scaling ${primarySkill} and ${secondarySkill} workloads, how would you handle fault tolerance, observability, and backward-compatible evolution?`,
      hint: 'Address failure domains, graceful degradation, contract versioning, and monitoring SLIs/SLOs.',
    },
  ];
};

/**
 * Deterministic fallback analyzer used when Gemini is not configured or temporarily unreachable.
 */
const buildFallbackJobDescriptionAnalysis = (input) => {
  const { jobDescription, roleTitle, category, skills: roleSkills } = input;
  const headingMatch = jobDescription.match(/^#\s*(?:Position|Job Title|Role)?\s*:?\s*(.+)$/im);
  const detectedRole = (headingMatch && headingMatch[1]?.trim()) || roleTitle || 'Target Role';
  const seniorityLevel = detectSeniorityFromText(jobDescription, detectedRole);
  const yearsOfExperience = extractYearsOfExperience(jobDescription);
  const sections = splitJobDescriptionSections(jobDescription);

  const extractedTech = extractSkillsFromText(jobDescription, roleSkills, sections);
  const technicalSkills =
    extractedTech.length > 0
      ? extractedTech
      : toStringArray(roleSkills, 8).length > 0
        ? toStringArray(roleSkills, 8)
        : ['Problem Solving', 'System Architecture', 'Testing & Quality'];

  const softSkills = SOFT_SKILL_KEYWORDS.filter((item) => item.pattern.test(jobDescription))
    .map((item) => item.label)
    .slice(0, 6);
  if (softSkills.length === 0) {
    softSkills.push('Structured Communication', 'Cross-Functional Collaboration', 'Problem Solving');
  }

  const skills = toStringArray([...technicalSkills, ...softSkills], 21);
  const responsibilities = extractResponsibilitiesFromText(jobDescription, sections);
  const experienceRequirements = extractExperienceRequirementsFromText(
    jobDescription,
    seniorityLevel,
    technicalSkills,
    sections
  );

  const focusAreas = technicalSkills.slice(0, 3).map((skill, idx) => ({
    topic: skill,
    priority: idx < 2 ? 'High' : 'Medium',
    reason: `Explicitly emphasized for ${detectedRole} (${category || 'technical'} track) readiness.`,
  }));

  const skillGapsToWatch = [
    `Articulating architectural trade-offs for ${technicalSkills[0] || 'core systems'}`,
    'Demonstrating measurable impact and edge-case handling under constraints',
  ];

  const preparationTips = [
    `Prepare 2 STAR stories demonstrating hands-on ownership with ${technicalSkills.slice(0, 2).join(' and ')}.`,
    `Review system design, debugging, and testing trade-offs tailored to ${seniorityLevel} expectations.`,
    'Quantify latency, reliability, or delivery improvements in your past examples.',
  ];

  const recommendedQuestions = buildFallbackQuestions(detectedRole, technicalSkills, focusAreas);

  return {
    detectedRole,
    seniorityLevel,
    yearsOfExperience,
    summary: `This ${seniorityLevel} ${detectedRole} description prioritizes ${technicalSkills.slice(0, 4).join(', ')} alongside structured technical communication and delivery ownership.`,
    skills,
    technicalSkills,
    softSkills,
    responsibilities,
    experienceRequirements,
    focusAreas,
    skillGapsToWatch,
    preparationTips,
    recommendedQuestions,
    analysisSource: 'fallback',
    analyzedAt: new Date().toISOString(),
  };
};

/**
 * Normalizes and validates raw AI output into a safe, consistent response shape.
 */
const normalizeAnalysisResult = (raw, input, source = 'gemini') => {
  const fallback = buildFallbackJobDescriptionAnalysis(input);

  const technicalSkills = toStringArray(raw?.technicalSkills, 12);
  const softSkills = toStringArray(raw?.softSkills, 6);
  const responsibilities = toStringArray(raw?.responsibilities, 6);
  const experienceRequirements = toStringArray(raw?.experienceRequirements, 6);
  const skillGapsToWatch = toStringArray(raw?.skillGapsToWatch, 4);
  const preparationTips = toStringArray(raw?.preparationTips, 4);

  const resolvedTechnicalSkills = technicalSkills.length > 0 ? technicalSkills : fallback.technicalSkills;
  const resolvedSoftSkills = softSkills.length > 0 ? softSkills : fallback.softSkills;
  const resolvedSkills = toStringArray([...resolvedTechnicalSkills, ...resolvedSoftSkills], 21);

  const yearsOfExperience =
    typeof raw?.yearsOfExperience === 'string' &&
    raw.yearsOfExperience.trim() &&
    raw.yearsOfExperience.trim().toLowerCase() !== 'null' &&
    raw.yearsOfExperience.trim().toLowerCase() !== 'not specified'
      ? raw.yearsOfExperience.trim()
      : fallback.yearsOfExperience;

  const focusAreas = Array.isArray(raw?.focusAreas)
    ? raw.focusAreas
        .filter((f) => f && typeof f.topic === 'string' && f.topic.trim())
        .slice(0, 5)
        .map((f) => ({
          topic: f.topic.trim(),
          priority: String(f.priority || '').toLowerCase() === 'medium' ? 'Medium' : 'High',
          reason: typeof f.reason === 'string' && f.reason.trim() ? f.reason.trim() : 'Core area highlighted in job description.',
        }))
    : [];

  const recommendedQuestions = Array.isArray(raw?.recommendedQuestions)
    ? raw.recommendedQuestions
        .filter((q) => q && typeof q.description === 'string' && q.description.trim())
        .slice(0, 6)
        .map((q, idx) => ({
          id: idx + 1,
          number: idx + 1,
          title: typeof q.title === 'string' && q.title.trim() ? q.title.trim() : `Question ${idx + 1}`,
          topic: typeof q.topic === 'string' && q.topic.trim() ? q.topic.trim() : 'Core Competency',
          difficulty: normalizeDifficulty(q.difficulty),
          duration: typeof q.duration === 'string' && q.duration.trim() ? q.duration.trim() : '5 min',
          description: q.description.trim(),
          hint:
            typeof q.hint === 'string' && q.hint.trim()
              ? q.hint.trim()
              : 'Structure your response with concrete examples, trade-offs, and measurable outcomes.',
        }))
    : [];

  return {
    detectedRole:
      typeof raw?.detectedRole === 'string' && raw.detectedRole.trim()
        ? raw.detectedRole.trim()
        : fallback.detectedRole,
    seniorityLevel:
      typeof raw?.seniorityLevel === 'string' && raw.seniorityLevel.trim()
        ? raw.seniorityLevel.trim()
        : fallback.seniorityLevel,
    yearsOfExperience,
    summary:
      typeof raw?.summary === 'string' && raw.summary.trim()
        ? raw.summary.trim()
        : fallback.summary,
    skills: resolvedSkills,
    technicalSkills: resolvedTechnicalSkills,
    softSkills: resolvedSoftSkills,
    responsibilities: responsibilities.length > 0 ? responsibilities : fallback.responsibilities,
    experienceRequirements:
      experienceRequirements.length > 0 ? experienceRequirements : fallback.experienceRequirements,
    focusAreas: focusAreas.length > 0 ? focusAreas : fallback.focusAreas,
    skillGapsToWatch: skillGapsToWatch.length > 0 ? skillGapsToWatch : fallback.skillGapsToWatch,
    preparationTips: preparationTips.length > 0 ? preparationTips : fallback.preparationTips,
    recommendedQuestions:
      recommendedQuestions.length > 0 ? recommendedQuestions : fallback.recommendedQuestions,
    analysisSource: source,
    analyzedAt: new Date().toISOString(),
  };
};

/**
 * Analyzes a mock interview job description using Gemini AI, falling back gracefully
 * to deterministic JD analysis if the AI service is unconfigured or unavailable.
 * @param {object} data
 * @returns {Promise<object>}
 */
const analyzeJobDescription = async (data = {}) => {
  const rawDescription = data.jobDescription || data.description || data.content || '';
  const jobDescription = String(rawDescription).trim();

  if (!jobDescription) {
    const error = new Error('Job description is required for analysis.');
    error.statusCode = 400;
    throw error;
  }

  const input = {
    jobDescription: jobDescription.slice(0, 15000),
    roleId: data.roleId ? String(data.roleId).trim() : null,
    roleTitle: data.roleTitle || data.title ? String(data.roleTitle || data.title).trim() : null,
    category: data.category ? String(data.category).trim() : null,
    skills: Array.isArray(data.skills) ? data.skills.slice(0, 20) : [],
  };

  if (typeof geminiService.analyzeMockInterviewJobDescription === 'function' && process.env.GEMINI_API_KEY) {
    try {
      const aiRaw = await geminiService.analyzeMockInterviewJobDescription(input);
      return normalizeAnalysisResult(aiRaw, input, 'gemini');
    } catch (err) {
      console.warn('Gemini JD analysis failed, using fallback analyzer:', err.message);
    }
  }

  return buildFallbackJobDescriptionAnalysis(input);
};

module.exports = {
  analyzeJobDescription,
  buildFallbackJobDescriptionAnalysis,
};
