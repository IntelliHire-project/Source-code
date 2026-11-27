const geminiService = require('./geminiService');

const TECH_KEYWORDS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular', 'HTML', 'CSS', 'Tailwind CSS',
  'Node.js', 'Express', 'NestJS', 'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot',
  'Go', 'Rust', 'C#', '.NET', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL',
  'REST APIs', 'Microservices', 'System Design', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
  'CI/CD', 'Git', 'Jest', 'Cypress', 'Playwright', 'Selenium', 'Automated Testing', 'API Testing',
  'Test Planning', 'Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems',
  'Tableau', 'Power BI', 'Statistical Modeling', 'Data Visualization', 'Machine Learning',
  'State Management', 'Web Performance', 'Kafka', 'RabbitMQ', 'Linux', 'Terraform',
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
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, maxItems);
};

const normalizeDifficulty = (value) => {
  const lower = String(value || '').toLowerCase();
  if (lower === 'easy') return 'Easy';
  if (lower === 'hard') return 'Hard';
  return 'Medium';
};

const detectSeniorityFromText = (text = '') => {
  const lower = text.toLowerCase();
  if (/\b(principal|staff|distinguished)\b/.test(lower)) return 'Principal';
  if (/\b(lead|architect|head of|manager)\b/.test(lower)) return 'Lead';
  if (/\b(senior|sr\.?|5\+\s*years|6\+\s*years|7\+\s*years)\b/.test(lower)) return 'Senior';
  if (/\b(junior|jr\.?|entry[- ]level|intern|graduate|0-2\s*years|1\+\s*year)\b/.test(lower)) return 'Junior';
  return 'Mid-Level';
};

const extractSkillsFromText = (text = '', roleSkills = []) => {
  const lowerText = text.toLowerCase();
  const candidates = [...new Set([...(Array.isArray(roleSkills) ? roleSkills : []), ...TECH_KEYWORDS])];
  const matched = [];

  for (const skill of candidates) {
    if (!skill || typeof skill !== 'string') continue;
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (regex.test(lowerText) && !matched.some((m) => m.toLowerCase() === skill.toLowerCase())) {
      matched.push(skill);
    }
  }

  return matched.slice(0, 12);
};

const extractResponsibilitiesFromText = (text = '') => {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s\-*•\d.)]+/, '').trim())
    .filter((line) => line.length >= 20 && line.length <= 220 && !line.startsWith('#') && !line.startsWith('**'));

  const actionLines = lines.filter((line) =>
    /\b(design|build|develop|architect|implement|maintain|collaborate|optimize|lead|test|analyze|deliver|drive|debug|manage|ensure|create)\b/i.test(line)
  );

  const selected = (actionLines.length > 0 ? actionLines : lines).slice(0, 5);
  return selected.length > 0
    ? selected
    : ['Deliver scalable, maintainable solutions aligned with role requirements and team standards.'];
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
  const seniorityLevel = detectSeniorityFromText(jobDescription);
  const extractedTech = extractSkillsFromText(jobDescription, roleSkills);
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

  const responsibilities = extractResponsibilitiesFromText(jobDescription);

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
    summary: `This ${seniorityLevel} ${detectedRole} description prioritizes ${technicalSkills.slice(0, 4).join(', ')} alongside structured technical communication and delivery ownership.`,
    technicalSkills,
    softSkills,
    responsibilities,
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
  const responsibilities = toStringArray(raw?.responsibilities, 5);
  const skillGapsToWatch = toStringArray(raw?.skillGapsToWatch, 4);
  const preparationTips = toStringArray(raw?.preparationTips, 4);

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
    summary:
      typeof raw?.summary === 'string' && raw.summary.trim()
        ? raw.summary.trim()
        : fallback.summary,
    technicalSkills: technicalSkills.length > 0 ? technicalSkills : fallback.technicalSkills,
    softSkills: softSkills.length > 0 ? softSkills : fallback.softSkills,
    responsibilities: responsibilities.length > 0 ? responsibilities : fallback.responsibilities,
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
