const geminiService = require('./geminiService');
const { analyzeJobDescription } = require('./mockInterviewJdAnalysisService');

const ALLOWED_FOCUS_TYPES = ['balanced', 'technical', 'behavioral', 'system_design'];
const ALLOWED_DIFFICULTIES = ['mixed', 'easy', 'medium', 'hard'];

const normalizeDifficulty = (value, preferred = 'mixed') => {
  if (preferred && preferred !== 'mixed') {
    const p = preferred.toLowerCase();
    if (p === 'easy') return 'Easy';
    if (p === 'hard') return 'Hard';
    if (p === 'medium') return 'Medium';
  }
  const lower = String(value || '').toLowerCase();
  if (lower === 'easy') return 'Easy';
  if (lower === 'hard') return 'Hard';
  return 'Medium';
};

const durationForDifficulty = (diff) => {
  if (diff === 'Easy') return '4 min';
  if (diff === 'Hard') return '8 min';
  return '5 min';
};

/**
 * Builds deterministic, varied interview questions grounded directly in the JD analysis
 * (extracted skills, responsibilities, and experience requirements) when Gemini is unavailable.
 */
const buildFallbackQuestionsFromJD = ({
  analysis,
  roleTitle,
  questionCount = 5,
  focusType = 'balanced',
  difficulty = 'mixed',
  excludeDescriptions = [],
  variantSeed = 0,
}) => {
  const role = analysis?.detectedRole || roleTitle || 'Target Role';
  const seniority = analysis?.seniorityLevel || 'Mid-Level';
  const years = analysis?.yearsOfExperience || null;
  const techSkills =
    Array.isArray(analysis?.technicalSkills) && analysis.technicalSkills.length > 0
      ? analysis.technicalSkills
      : ['Core Engineering', 'System Design', 'Testing & Quality'];
  const softSkills =
    Array.isArray(analysis?.softSkills) && analysis.softSkills.length > 0
      ? analysis.softSkills
      : ['Cross-Functional Collaboration', 'Structured Communication'];
  const responsibilities =
    Array.isArray(analysis?.responsibilities) && analysis.responsibilities.length > 0
      ? analysis.responsibilities
      : [`Deliver scalable, production-ready work for ${role}`];
  const experienceReqs =
    Array.isArray(analysis?.experienceRequirements) && analysis.experienceRequirements.length > 0
      ? analysis.experienceRequirements
      : [`${seniority}-level hands-on production experience`];

  const s0 = techSkills[0] || 'Core Technology';
  const s1 = techSkills[1] || techSkills[0] || 'Architecture';
  const s2 = techSkills[2] || techSkills[0] || 'Debugging';
  const s3 = techSkills[3] || techSkills[1] || 'Reliability';
  const r0 = responsibilities[0];
  const r1 = responsibilities[1] || responsibilities[0];
  const r2 = responsibilities[2] || responsibilities[0];
  const exp0 = experienceReqs[0];
  const exp1 = experienceReqs[1] || experienceReqs[0];
  const soft0 = softSkills[0] || 'Cross-Functional Collaboration';
  const soft1 = softSkills[1] || softSkills[0] || 'Technical Leadership';

  const technicalPool = [
    {
      topic: s0,
      difficulty: 'Easy',
      jdReference: `Skill: ${s0}`,
      description: `In this ${role} description, ${s0} is a core requirement. Walk through a production feature or system where you used ${s0}, and explain the patterns you chose to keep the code maintainable and testable.`,
      hint: `Give a concrete example using ${s0}, explain key best practices, and mention measurable results or bugs avoided.`,
    },
    {
      topic: `${s0} & ${s1}`,
      difficulty: 'Medium',
      jdReference: `Responsibility: ${r0.slice(0, 48)}${r0.length > 48 ? '...' : ''}`,
      description: `The role expects you to: "${r0}". How would you apply ${s0} and ${s1} to fulfill this responsibility end-to-end, and what trade-offs would you weigh?`,
      hint: `Break the responsibility into concrete design steps, justify your ${s0}/${s1} choices, and explain failure handling.`,
    },
    {
      topic: s2,
      difficulty: 'Medium',
      jdReference: `Skill: ${s2}`,
      description: `Suppose an application relying on ${s2} experiences sudden latency spikes or intermittent failures in production. Walk through your step-by-step troubleshooting, observability, and remediation strategy.`,
      hint: `Cover telemetry/logs, isolating ${s2} bottlenecks, safe mitigation/rollback, and post-incident prevention.`,
    },
    {
      topic: `${s1} & ${s3}`,
      difficulty: 'Hard',
      jdReference: `Experience: ${exp0.slice(0, 48)}${exp0.length > 48 ? '...' : ''}`,
      description: `Given the requirement (${exp0}), describe how you would test, monitor, and safeguard backward compatibility when evolving a critical ${s1} and ${s3} workflow under load.`,
      hint: 'Discuss automated test coverage, staged rollouts, SLIs/SLOs, and backward-compatible contract evolution.',
    },
  ];

  const systemDesignPool = [
    {
      topic: `Architecture (${s0} & ${s1})`,
      difficulty: 'Hard',
      jdReference: `Responsibility: ${r1.slice(0, 48)}${r1.length > 48 ? '...' : ''}`,
      description: `To deliver on "${r1}" at ${seniority} scale for ${role}, design the high-level architecture using ${s0} and ${s1}. How do you address scalability, data consistency, and fault tolerance?`,
      hint: 'Clarify scale assumptions, draw component boundaries, explain bottlenecks, and compare architectural trade-offs.',
    },
    {
      topic: `Scalability & ${s2}`,
      difficulty: 'Medium',
      jdReference: `Skill: ${s2}`,
      description: `How would you architect caching, rate limiting, or asynchronous processing around ${s2} to keep response times predictable during traffic spikes?`,
      hint: 'Explain cache invalidation or queue backpressure, failure fallbacks, and observability metrics.',
    },
  ];

  const behavioralPool = [
    {
      topic: soft0,
      difficulty: 'Medium',
      jdReference: `Soft Skill: ${soft0}`,
      description: `This ${seniority} ${role} role emphasizes ${soft0}. Tell me about a time you had to align engineering or product stakeholders on a difficult technical trade-off—what happened and what was the outcome?`,
      hint: 'Use the STAR framework (Situation, Task, Action, Result) and highlight objective decision criteria.',
    },
    {
      topic: `Experience & Ownership`,
      difficulty: 'Medium',
      jdReference: years ? `Experience: ${years}` : `Experience: ${seniority} Level`,
      description: `Drawing on your background (${exp1}), describe the most ambiguous technical problem you owned in a ${role}-adjacent project and how you drove it to completion.`,
      hint: 'Focus on how you reduced ambiguity, coordinated with teammates, and verified the final impact.',
    },
    {
      topic: soft1,
      difficulty: 'Easy',
      jdReference: `Responsibility: ${r2.slice(0, 48)}${r2.length > 48 ? '...' : ''}`,
      description: `How do you approach code reviews, mentoring, or quality standards when collaborating across teams to deliver "${r2}"?`,
      hint: 'Highlight constructive feedback practices, shared standards, and measurable team velocity or quality gains.',
    },
  ];

  let combinedPool;
  if (focusType === 'technical') {
    combinedPool = [...technicalPool, ...systemDesignPool, ...behavioralPool];
  } else if (focusType === 'behavioral') {
    combinedPool = [...behavioralPool, ...technicalPool, ...systemDesignPool];
  } else if (focusType === 'system_design') {
    combinedPool = [...systemDesignPool, ...technicalPool, ...behavioralPool];
  } else {
    combinedPool = [
      technicalPool[0],
      technicalPool[1],
      systemDesignPool[0],
      behavioralPool[0],
      technicalPool[2],
      behavioralPool[1],
      technicalPool[3],
      systemDesignPool[1],
      behavioralPool[2],
    ];
  }

  const excludedSet = new Set(
    (Array.isArray(excludeDescriptions) ? excludeDescriptions : [])
      .map((d) => String(d || '').trim().toLowerCase())
      .filter(Boolean)
  );

  const filteredPool = combinedPool.filter(
    (item) => !excludedSet.has(item.description.trim().toLowerCase())
  );
  const activePool = filteredPool.length > 0 ? filteredPool : combinedPool;

  const startOffset = Math.abs(Number(variantSeed) || 0) % activePool.length;
  const rotatedPool = [...activePool.slice(startOffset), ...activePool.slice(0, startOffset)];

  const selected = [];
  for (let i = 0; i < questionCount; i++) {
    const template = rotatedPool[i % rotatedPool.length];
    const resolvedDiff = normalizeDifficulty(template.difficulty, difficulty);
    selected.push({
      id: i + 1,
      number: i + 1,
      title: `Question ${i + 1}`,
      topic: template.topic,
      difficulty: resolvedDiff,
      duration: durationForDifficulty(resolvedDiff),
      jdReference: template.jdReference,
      description: template.description,
      hint: template.hint,
    });
  }

  return selected;
};

/**
 * Normalizes raw Gemini questions into a consistent array.
 */
const normalizeGeneratedQuestions = (rawQuestions, fallbackQuestions, preferredDifficulty = 'mixed') => {
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    return fallbackQuestions;
  }

  const cleaned = rawQuestions
    .filter((q) => q && typeof q.description === 'string' && q.description.trim())
    .map((q, idx) => {
      const diff = normalizeDifficulty(q.difficulty, preferredDifficulty);
      return {
        id: idx + 1,
        number: idx + 1,
        title: typeof q.title === 'string' && q.title.trim() ? q.title.trim() : `Question ${idx + 1}`,
        topic: typeof q.topic === 'string' && q.topic.trim() ? q.topic.trim() : 'JD Competency',
        difficulty: diff,
        duration: typeof q.duration === 'string' && q.duration.trim() ? q.duration.trim() : durationForDifficulty(diff),
        jdReference:
          typeof q.jdReference === 'string' && q.jdReference.trim()
            ? q.jdReference.trim()
            : 'Job Description Match',
        description: q.description.trim(),
        hint:
          typeof q.hint === 'string' && q.hint.trim()
            ? q.hint.trim()
            : 'Structure your response with concrete examples, trade-offs, and measurable outcomes.',
      };
    });

  return cleaned.length > 0 ? cleaned : fallbackQuestions;
};

/**
 * Generates mock interview questions integrated with the Job Description and its AI analysis
 * (extracted skills, responsibilities, and experience requirements).
 * @param {object} data
 * @returns {Promise<object>}
 */
const generateQuestionsFromJobDescription = async (data = {}) => {
  const rawDescription = data.jobDescription || data.description || data.content || '';
  const jobDescription = String(rawDescription).trim();
  const roleId = data.roleId ? String(data.roleId).trim() : null;
  const roleTitle = data.roleTitle || data.title ? String(data.roleTitle || data.title).trim() : null;
  const category = data.category ? String(data.category).trim() : null;
  const skills = Array.isArray(data.skills) ? data.skills.slice(0, 20) : [];

  const questionCount = Math.max(1, Math.min(10, parseInt(data.questionCount, 10) || 5));
  const focusType = ALLOWED_FOCUS_TYPES.includes(String(data.focusType || '').toLowerCase())
    ? String(data.focusType).toLowerCase()
    : 'balanced';
  const difficulty = ALLOWED_DIFFICULTIES.includes(String(data.difficulty || '').toLowerCase())
    ? String(data.difficulty).toLowerCase()
    : 'mixed';
  const excludeDescriptions = Array.isArray(data.excludeDescriptions) ? data.excludeDescriptions.slice(0, 20) : [];
  const variantSeed = Number(data.variantSeed) || 0;

  let analysis = data.jdAnalysis && typeof data.jdAnalysis === 'object' ? data.jdAnalysis : null;

  if (!analysis && jobDescription.length >= 5) {
    analysis = await analyzeJobDescription({
      jobDescription,
      roleId,
      roleTitle,
      category,
      skills,
    });
  } else if (!analysis && roleTitle) {
    analysis = await analyzeJobDescription({
      jobDescription: `Target Role: ${roleTitle}. Skills: ${skills.join(', ') || 'Core competencies'}.`,
      roleId,
      roleTitle,
      category,
      skills,
    });
  }

  if (!analysis && !jobDescription) {
    const error = new Error('Job description or role context is required to generate questions.');
    error.statusCode = 400;
    throw error;
  }

  const fallbackQuestions = buildFallbackQuestionsFromJD({
    analysis,
    roleTitle,
    questionCount,
    focusType,
    difficulty,
    excludeDescriptions,
    variantSeed,
  });

  let generationSource = 'fallback';
  let questions = fallbackQuestions;

  if (typeof geminiService.generateMockInterviewQuestions === 'function' && process.env.GEMINI_API_KEY) {
    try {
      const aiResult = await geminiService.generateMockInterviewQuestions({
        jobDescription: jobDescription.slice(0, 12000),
        jdAnalysis: {
          detectedRole: analysis?.detectedRole,
          seniorityLevel: analysis?.seniorityLevel,
          yearsOfExperience: analysis?.yearsOfExperience,
          technicalSkills: analysis?.technicalSkills,
          softSkills: analysis?.softSkills,
          responsibilities: analysis?.responsibilities,
          experienceRequirements: analysis?.experienceRequirements,
          focusAreas: analysis?.focusAreas,
        },
        roleId,
        roleTitle,
        category,
        questionCount,
        focusType,
        difficulty,
        excludeDescriptions,
      });

      questions = normalizeGeneratedQuestions(aiResult?.questions, fallbackQuestions, difficulty).slice(
        0,
        questionCount
      );
      generationSource = 'gemini';
    } catch (err) {
      console.warn('Gemini question generation failed, using JD-integrated fallback:', err.message);
    }
  }

  return {
    questions,
    analysis,
    generationSource,
    parameters: {
      questionCount,
      focusType,
      difficulty,
    },
    generatedAt: new Date().toISOString(),
  };
};

module.exports = {
  ALLOWED_FOCUS_TYPES,
  ALLOWED_DIFFICULTIES,
  generateQuestionsFromJobDescription,
  buildFallbackQuestionsFromJD,
};
