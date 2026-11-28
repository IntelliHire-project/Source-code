const geminiService = require('./geminiService');
const { analyzeJobDescription } = require('./mockInterviewJdAnalysisService');
const { findJobRoleById, DEFAULT_ROLES } = require('../models/mockInterviewRoleModel');

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
 * Resolves the full role profile (title, category, description, core skills)
 * from request parameters and the role repository.
 */
const resolveRoleProfile = async ({ roleId, roleTitle, roleDescription, category, skills }) => {
  let matchedRole = null;

  if (roleId) {
    try {
      matchedRole = await findJobRoleById(roleId);
    } catch {
      // Fall back to DEFAULT_ROLES below
    }
    if (!matchedRole && Array.isArray(DEFAULT_ROLES)) {
      matchedRole = DEFAULT_ROLES.find(
        (r) => r.id === roleId || r.roleId === roleId
      ) || null;
    }
  }

  if (!matchedRole && roleTitle && Array.isArray(DEFAULT_ROLES)) {
    const titleLower = String(roleTitle).trim().toLowerCase();
    matchedRole = DEFAULT_ROLES.find(
      (r) => r.title && r.title.toLowerCase() === titleLower
    ) || null;
  }

  const resolvedTitle = roleTitle || matchedRole?.title || null;
  const resolvedCategory = category || matchedRole?.category || 'engineering';
  const resolvedDescription = roleDescription || matchedRole?.description || '';
  const mergedSkills = [
    ...(Array.isArray(skills) ? skills : []),
    ...(Array.isArray(matchedRole?.skills) ? matchedRole.skills : []),
  ]
    .map((s) => String(s || '').trim())
    .filter(Boolean);

  return {
    roleId: roleId || matchedRole?.roleId || matchedRole?.id || null,
    title: resolvedTitle,
    category: String(resolvedCategory).toLowerCase(),
    description: resolvedDescription,
    skills: [...new Set(mergedSkills)],
  };
};

/**
 * Determines the domain track used for role-specific question framing.
 */
const detectRoleTrack = (roleProfile, detectedRole) => {
  const combined = `${roleProfile?.roleId || ''} ${roleProfile?.title || ''} ${roleProfile?.category || ''} ${detectedRole || ''}`.toLowerCase();

  if (/\b(uiux|ui\/ux|ux|designer|design|figma|product design)\b/.test(combined)) return 'design';
  if (/\b(qa|quality assurance|test engineer|testing|sdet|automation)\b/.test(combined)) return 'qa';
  if (/\b(data|analyst|analytics|bi|tableau|statistical|scientist|ml)\b/.test(combined)) return 'data';
  if (/\b(frontend|front-end|react|vue|angular|ui developer)\b/.test(combined)) return 'frontend';
  if (/\b(backend|back-end|api|server|database|microservices)\b/.test(combined)) return 'backend';
  return 'general';
};

/**
 * Builds role-specific + JD-based fallback interview questions grounded in
 * the resolved role profile and extracted JD skills, responsibilities, and experience requirements.
 */
const buildFallbackQuestionsFromJD = ({
  analysis,
  roleProfile,
  roleTitle,
  questionCount = 5,
  focusType = 'balanced',
  difficulty = 'mixed',
  excludeDescriptions = [],
  variantSeed = 0,
}) => {
  const role = roleProfile?.title || analysis?.detectedRole || roleTitle || 'Target Role';
  const seniority = analysis?.seniorityLevel || 'Mid-Level';
  const years = analysis?.yearsOfExperience || null;
  const track = detectRoleTrack(roleProfile, analysis?.detectedRole);

  const mergedTechSkills = [
    ...(Array.isArray(analysis?.technicalSkills) ? analysis.technicalSkills : []),
    ...(Array.isArray(roleProfile?.skills) ? roleProfile.skills : []),
  ].filter(Boolean);
  const techSkills = [...new Set(mergedTechSkills)];
  if (techSkills.length === 0) {
    techSkills.push('Domain Fundamentals', 'Problem Solving', 'Quality & Delivery');
  }

  const softSkills =
    Array.isArray(analysis?.softSkills) && analysis.softSkills.length > 0
      ? analysis.softSkills
      : ['Cross-Functional Collaboration', 'Structured Communication'];
  const responsibilities =
    Array.isArray(analysis?.responsibilities) && analysis.responsibilities.length > 0
      ? analysis.responsibilities
      : [`Deliver high-impact, production-ready outcomes as a ${role}`];
  const experienceReqs =
    Array.isArray(analysis?.experienceRequirements) && analysis.experienceRequirements.length > 0
      ? analysis.experienceRequirements
      : [`${seniority}-level hands-on experience in ${role}`];

  const s0 = techSkills[0];
  const s1 = techSkills[1] || techSkills[0];
  const s2 = techSkills[2] || techSkills[0];
  const s3 = techSkills[3] || techSkills[1] || techSkills[0];
  const r0 = responsibilities[0];
  const r1 = responsibilities[1] || responsibilities[0];
  const r2 = responsibilities[2] || responsibilities[0];
  const exp0 = experienceReqs[0];
  const exp1 = experienceReqs[1] || experienceReqs[0];
  const soft0 = softSkills[0];
  const soft1 = softSkills[1] || softSkills[0];

  const shortRef = (prefix, text) =>
    `${prefix}: ${text.slice(0, 44)}${text.length > 44 ? '...' : ''}`;

  let technicalPool;
  let systemDesignPool;

  if (track === 'design') {
    technicalPool = [
      {
        topic: `${s0} & User-Centered Craft`,
        difficulty: 'Easy',
        jdReference: `Skill: ${s0}`,
        description: `For this ${role} position, ${s0} is highlighted in the job description. Walk through a product flow you designed using ${s0}, and explain how user feedback shaped your design decisions.`,
        hint: `Explain the user problem, how you applied ${s0}, iterations you made, and measurable usability outcomes.`,
      },
      {
        topic: `Delivering ${s1}`,
        difficulty: 'Medium',
        jdReference: shortRef('Responsibility', r0),
        description: `The JD asks you to "${r0}". How do you bridge ${s0} and ${s1} from discovery wireframes to developer-ready specs without losing visual consistency?`,
        hint: 'Cover user flows, edge states, component specs, and collaboration with engineering.',
      },
      {
        topic: `Accessibility & Usability (${s2})`,
        difficulty: 'Medium',
        jdReference: `Skill: ${s2}`,
        description: `Suppose usability testing reveals users drop off mid-flow in a key screen you designed with ${s2}. Walk through your diagnostic process and how you validate a redesign.`,
        hint: 'Discuss heuristic evaluation, accessibility checks (WCAG/contrast/keyboard), and validation metrics.',
      },
      {
        topic: `Design Critique & Handoff`,
        difficulty: 'Hard',
        jdReference: shortRef('Experience', exp0),
        description: `Given the expectation (${exp0}), describe how you balance visual polish, WCAG accessibility, and tight engineering deadlines when shipping a complex multi-state interface.`,
        hint: 'Show how you prioritize user impact, document edge states, and partner with engineers.',
      },
    ];
    systemDesignPool = [
      {
        topic: `Design Systems & Information Architecture`,
        difficulty: 'Hard',
        jdReference: shortRef('Responsibility', r1),
        description: `To support "${r1}" for ${role}, how would you structure a scalable design system and token hierarchy using ${s0} and ${s1} across multiple product surfaces?`,
        hint: 'Address component variants, semantic tokens, governance, and adoption across squads.',
      },
      {
        topic: `Prototyping & Experimentation`,
        difficulty: 'Medium',
        jdReference: `Skill: ${s2}`,
        description: `How do you decide between low-fidelity wireframes and high-fidelity interactive prototypes in ${s2} when aligning stakeholders on an ambiguous product initiative?`,
        hint: 'Explain fidelity trade-offs, test hypotheses, and how you gather unbiased user signals.',
      },
    ];
  } else if (track === 'qa') {
    technicalPool = [
      {
        topic: `${s0} & Test Automation`,
        difficulty: 'Easy',
        jdReference: `Skill: ${s0}`,
        description: `In this ${role} description, ${s0} is a core skill. Describe how you structure maintainable automated test suites with ${s0} so tests stay fast and reliable as the product evolves.`,
        hint: 'Cover test isolation, page-object/fixture patterns, deterministic test data, and CI execution.',
      },
      {
        topic: `Quality Strategy (${s1})`,
        difficulty: 'Medium',
        jdReference: shortRef('Responsibility', r0),
        description: `The role expects you to "${r0}". How would you design a risk-based test plan combining ${s0} and ${s1} before a major release?`,
        hint: 'Detail test pyramid balance, critical user journeys, API vs UI coverage, and exit criteria.',
      },
      {
        topic: `Flaky Tests & Defect Triage (${s2})`,
        difficulty: 'Medium',
        jdReference: `Skill: ${s2}`,
        description: `An automated ${s2} suite starts failing intermittently in CI right before release. Walk through how you isolate flakiness vs real regressions and prevent recurrence.`,
        hint: 'Cover timing/race conditions, environment parity, logs/traces, and quarantine policies.',
      },
      {
        topic: `CI/CD Quality Gates`,
        difficulty: 'Hard',
        jdReference: shortRef('Experience', exp0),
        description: `Aligned with (${exp0}), how do you integrate ${s1} and ${s3} into CI/CD pipelines to catch breaking regressions early without slowing developer velocity?`,
        hint: 'Discuss smoke vs full regression tiers, parallelization, contract tests, and defect metrics.',
      },
    ];
    systemDesignPool = [
      {
        topic: `End-to-End Quality Architecture`,
        difficulty: 'Hard',
        jdReference: shortRef('Responsibility', r1),
        description: `To fulfill "${r1}" as a ${role}, design an end-to-end QA architecture covering API contracts, UI automation (${s0}), test environments, and release sign-off.`,
        hint: 'Explain environment seeding, mocking external dependencies, observability, and rollback verification.',
      },
      {
        topic: `Non-Functional & API Testing (${s2})`,
        difficulty: 'Medium',
        jdReference: `Skill: ${s2}`,
        description: `How do you validate API edge cases, security boundaries, and performance regressions using ${s2} when backend services change rapidly?`,
        hint: 'Cover schema/contract validation, boundary inputs, concurrency checks, and baseline thresholds.',
      },
    ];
  } else if (track === 'data') {
    technicalPool = [
      {
        topic: `${s0} & Analytical Foundations`,
        difficulty: 'Easy',
        jdReference: `Skill: ${s0}`,
        description: `For this ${role} role, ${s0} is essential. Walk through a real analysis where you used ${s0} to uncover an unexpected trend or answer an ambiguous business question.`,
        hint: 'Explain the business question, data cleaning steps, query/model logic, and decision impact.',
      },
      {
        topic: `Metrics & Insights (${s1})`,
        difficulty: 'Medium',
        jdReference: shortRef('Responsibility', r0),
        description: `The JD highlights: "${r0}". How would you combine ${s0} and ${s1} to define reliable KPIs and present actionable findings to non-technical stakeholders?`,
        hint: 'Focus on metric definitions, cohort/segmentation choices, caveats, and clear storytelling.',
      },
      {
        topic: `Data Quality & Anomaly Diagnosis (${s2})`,
        difficulty: 'Medium',
        jdReference: `Skill: ${s2}`,
        description: `A key executive metric reported via ${s2} drops 18% overnight. Walk through your systematic investigation to determine whether it is a pipeline bug, tracking change, or real user shift.`,
        hint: 'Check upstream ingestion, schema changes, seasonality, segment breakdown, and validation queries.',
      },
      {
        topic: `Statistical Rigor & Modeling`,
        difficulty: 'Hard',
        jdReference: shortRef('Experience', exp0),
        description: `Considering (${exp0}), how do you design an A/B test or statistical evaluation using ${s1} and ${s3} when sample sizes are uneven or external factors introduce bias?`,
        hint: 'Cover hypothesis framing, statistical power, confounding variables, and guardrail metrics.',
      },
    ];
    systemDesignPool = [
      {
        topic: `Analytics Pipeline & Dashboard Architecture`,
        difficulty: 'Hard',
        jdReference: shortRef('Responsibility', r1),
        description: `To deliver "${r1}" for ${role}, design a reporting and analytics workflow using ${s0} and ${s1} that balances query speed, data freshness, and single-source-of-truth governance.`,
        hint: 'Discuss transformation layers, aggregation grain, freshness SLAs, and automated data tests.',
      },
      {
        topic: `Data Visualization & Executive Storytelling (${s2})`,
        difficulty: 'Medium',
        jdReference: `Skill: ${s2}`,
        description: `How do you design dashboards in ${s2} so stakeholders can self-serve answers without misinterpreting averages, correlations, or incomplete time windows?`,
        hint: 'Explain visual hierarchy, clear annotations, drill-down paths, and metric guardrails.',
      },
    ];
  } else if (track === 'frontend') {
    technicalPool = [
      {
        topic: `${s0} Component Architecture`,
        difficulty: 'Easy',
        jdReference: `Skill: ${s0}`,
        description: `In this ${role} JD, ${s0} is a core skill. How do you structure reusable components, prop contracts, and state boundaries in ${s0} so features stay easy to test and maintain?`,
        hint: `Explain separation of presentation vs state logic in ${s0}, composition patterns, and avoiding prop drilling.`,
      },
      {
        topic: `UI Delivery (${s1})`,
        difficulty: 'Medium',
        jdReference: shortRef('Responsibility', r0),
        description: `The role expects you to "${r0}". How would you implement this using ${s0} and ${s1} while handling loading, empty, error, and responsive states cleanly?`,
        hint: 'Cover asynchronous data flow, optimistic vs pessimistic UI updates, and accessibility.',
      },
      {
        topic: `Frontend Performance & Debugging (${s2})`,
        difficulty: 'Medium',
        jdReference: `Skill: ${s2}`,
        description: `A complex page built with ${s0} and ${s2} suffers sluggish interactions and layout shifts on mobile devices. Walk through how you profile and fix rendering bottlenecks.`,
        hint: 'Discuss Core Web Vitals, memoization/code-splitting, bundle analysis, and unnecessary re-renders.',
      },
      {
        topic: `State, Security & Resilience`,
        difficulty: 'Hard',
        jdReference: shortRef('Experience', exp0),
        description: `Given (${exp0}), how do you manage client-side caching, authentication state, and XSS/CSRF safeguards across a large ${role} codebase?`,
        hint: 'Address token lifecycle, stale-while-revalidate caching, input sanitization, and error boundaries.',
      },
    ];
    systemDesignPool = [
      {
        topic: `Frontend System Architecture (${s0} & ${s1})`,
        difficulty: 'Hard',
        jdReference: shortRef('Responsibility', r1),
        description: `To support "${r1}" at ${seniority} level for ${role}, architect a scalable frontend module using ${s0} and ${s1} covering routing, state synchronization, and API error recovery.`,
        hint: 'Detail folder/module boundaries, state ownership, caching strategy, and automated UI testing.',
      },
      {
        topic: `Accessibility & Cross-Browser UX (${s2})`,
        difficulty: 'Medium',
        jdReference: `Skill: ${s2}`,
        description: `How do you build keyboard navigation, screen-reader support, and responsive layouts into ${s2} components without slowing down feature delivery?`,
        hint: 'Mention semantic HTML, ARIA patterns, focus management, and automated accessibility checks.',
      },
    ];
  } else {
    // 'backend' or 'general'
    technicalPool = [
      {
        topic: `${s0} Production Craft`,
        difficulty: 'Easy',
        jdReference: `Skill: ${s0}`,
        description: `In this ${role} description, ${s0} is a core requirement. Walk through a production feature or service where you applied ${s0}, and explain the patterns you used for maintainability and testing.`,
        hint: `Give a concrete example using ${s0}, explain key best practices, and highlight measurable outcomes.`,
      },
      {
        topic: `${s0} & ${s1}`,
        difficulty: 'Medium',
        jdReference: shortRef('Responsibility', r0),
        description: `The role expects you to: "${r0}". How would you apply ${s0} and ${s1} to fulfill this responsibility end-to-end, and what trade-offs would you weigh?`,
        hint: `Break the responsibility into concrete implementation steps, justify your ${s0}/${s1} choices, and explain failure handling.`,
      },
      {
        topic: `${s2} Diagnostics`,
        difficulty: 'Medium',
        jdReference: `Skill: ${s2}`,
        description: `Suppose a production workflow relying on ${s2} experiences sudden latency spikes or intermittent errors. Walk through your step-by-step diagnostic, observability, and remediation plan.`,
        hint: `Cover telemetry/logs, isolating ${s2} bottlenecks, safe rollback/mitigation, and long-term prevention.`,
      },
      {
        topic: `${s1} & ${s3} Reliability`,
        difficulty: 'Hard',
        jdReference: shortRef('Experience', exp0),
        description: `Given the requirement (${exp0}), describe how you would test, monitor, and preserve backward compatibility when evolving a critical ${s1} and ${s3} workflow under load.`,
        hint: 'Discuss automated test coverage, staged rollouts, SLIs/SLOs, and backward-compatible contract evolution.',
      },
    ];
    systemDesignPool = [
      {
        topic: `Architecture (${s0} & ${s1})`,
        difficulty: 'Hard',
        jdReference: shortRef('Responsibility', r1),
        description: `To deliver on "${r1}" at ${seniority} scale for ${role}, design the high-level architecture using ${s0} and ${s1}. How do you address scalability, data consistency, and fault tolerance?`,
        hint: 'Clarify scale assumptions, draw component boundaries, explain bottlenecks, and compare architectural trade-offs.',
      },
      {
        topic: `Scalability & ${s2}`,
        difficulty: 'Medium',
        jdReference: `Skill: ${s2}`,
        description: `How would you design caching, rate limiting, or asynchronous processing around ${s2} to keep performance predictable during traffic spikes?`,
        hint: 'Explain cache invalidation or queue backpressure, failure fallbacks, and observability metrics.',
      },
    ];
  }

  const behavioralPool = [
    {
      topic: soft0,
      difficulty: 'Medium',
      jdReference: `Soft Skill: ${soft0}`,
      description: `This ${seniority} ${role} role emphasizes ${soft0}. Tell me about a time you had to align stakeholders or teammates on a difficult technical or product trade-off—what happened and what was the outcome?`,
      hint: 'Use the STAR framework (Situation, Task, Action, Result) and highlight objective decision criteria.',
    },
    {
      topic: `Experience & Ownership`,
      difficulty: 'Medium',
      jdReference: years ? `Experience: ${years}` : `Experience: ${seniority} Level`,
      description: `Drawing on your background (${exp1}), describe the most ambiguous problem you owned as a ${role} (or similar role) and how you drove it to completion.`,
      hint: 'Focus on how you reduced ambiguity, coordinated with teammates, and verified measurable impact.',
    },
    {
      topic: soft1,
      difficulty: 'Easy',
      jdReference: shortRef('Responsibility', r2),
      description: `As a ${role}, how do you uphold quality standards, peer feedback, and cross-team alignment when delivering "${r2}"?`,
      hint: 'Highlight constructive feedback practices, shared standards, and measurable team quality or velocity gains.',
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
      roleAlignment: role,
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
const normalizeGeneratedQuestions = (
  rawQuestions,
  fallbackQuestions,
  preferredDifficulty = 'mixed',
  defaultRoleLabel = 'Target Role'
) => {
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
        topic: typeof q.topic === 'string' && q.topic.trim() ? q.topic.trim() : 'Role & JD Competency',
        difficulty: diff,
        duration: typeof q.duration === 'string' && q.duration.trim() ? q.duration.trim() : durationForDifficulty(diff),
        roleAlignment:
          typeof q.roleAlignment === 'string' && q.roleAlignment.trim()
            ? q.roleAlignment.trim()
            : defaultRoleLabel,
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
 * Generates role-specific and JD-based mock interview questions using the resolved role profile
 * and extracted Job Description analysis (skills, responsibilities, and experience requirements).
 * @param {object} data
 * @returns {Promise<object>}
 */
const generateQuestionsFromJobDescription = async (data = {}) => {
  const rawDescription = data.jobDescription || data.description || data.content || '';
  const jobDescription = String(rawDescription).trim();
  const roleId = data.roleId ? String(data.roleId).trim() : null;
  const roleTitle = data.roleTitle || data.title ? String(data.roleTitle || data.title).trim() : null;
  const roleDescription = data.roleDescription ? String(data.roleDescription).trim() : null;
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

  const roleProfile = await resolveRoleProfile({
    roleId,
    roleTitle,
    roleDescription,
    category,
    skills,
  });

  let analysis = data.jdAnalysis && typeof data.jdAnalysis === 'object' ? data.jdAnalysis : null;

  if (!analysis && jobDescription.length >= 5) {
    analysis = await analyzeJobDescription({
      jobDescription,
      roleId: roleProfile.roleId,
      roleTitle: roleProfile.title,
      category: roleProfile.category,
      skills: roleProfile.skills,
    });
  } else if (!analysis && roleProfile.title) {
    const synthesizedRoleJd = [
      `Target Role: ${roleProfile.title}`,
      roleProfile.description ? `Overview: ${roleProfile.description}` : '',
      roleProfile.skills.length > 0 ? `Skills: ${roleProfile.skills.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    analysis = await analyzeJobDescription({
      jobDescription: synthesizedRoleJd,
      roleId: roleProfile.roleId,
      roleTitle: roleProfile.title,
      category: roleProfile.category,
      skills: roleProfile.skills,
    });
  }

  if (!analysis && !jobDescription) {
    const error = new Error('Job description or role context is required to generate questions.');
    error.statusCode = 400;
    throw error;
  }

  const effectiveRoleLabel = roleProfile.title || analysis?.detectedRole || 'Target Role';

  const fallbackQuestions = buildFallbackQuestionsFromJD({
    analysis,
    roleProfile,
    roleTitle: effectiveRoleLabel,
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
        roleProfile: {
          roleId: roleProfile.roleId,
          title: effectiveRoleLabel,
          category: roleProfile.category,
          description: roleProfile.description,
          coreSkills: roleProfile.skills,
        },
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
        roleId: roleProfile.roleId,
        roleTitle: effectiveRoleLabel,
        category: roleProfile.category,
        questionCount,
        focusType,
        difficulty,
        excludeDescriptions,
      });

      questions = normalizeGeneratedQuestions(
        aiResult?.questions,
        fallbackQuestions,
        difficulty,
        effectiveRoleLabel
      ).slice(0, questionCount);
      generationSource = 'gemini';
    } catch (err) {
      console.warn('Gemini question generation failed, using role & JD fallback:', err.message);
    }
  }

  return {
    questions,
    analysis,
    roleProfile,
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
  resolveRoleProfile,
  detectRoleTrack,
  generateQuestionsFromJobDescription,
  buildFallbackQuestionsFromJD,
};
