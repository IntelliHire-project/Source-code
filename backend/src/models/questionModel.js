const db = require('../config/db');

/**
 * Formats a raw DB row to camelCase and the structure expected by the frontend.
 */
const formatQuestionRow = (row, authorName = null) => {
  if (!row) return null;

  const dateCreated = row.created_at
    ? new Date(row.created_at).toISOString().split('T')[0]
    : '';

  const details = typeof row.details === 'object' && row.details !== null
    ? row.details
    : (typeof row.details === 'string' ? JSON.parse(row.details || '{}') : {});

  const skills = Array.isArray(row.skills)
    ? row.skills
    : (typeof row.skills === 'string' ? JSON.parse(row.skills || '[]') : []);

  const author =
    authorName ||
    row.author_name ||
    'IntelliHire Team';

  return {
    id: row.question_code || String(row.id),
    numericId: row.id,
    questionCode: row.question_code,
    title: row.title,
    prompt: row.prompt,
    questionText: row.prompt,
    category: row.category,
    section: row.section || 'Section 2: Technical Concepts',
    role: row.job_role || '',
    jobRole: row.job_role || '',
    skills,
    difficulty: row.difficulty || 'Medium',
    type: row.type || 'Multiple Choice',
    questionType: row.type || 'Multiple Choice',
    status: row.status || 'Published',
    points: row.points != null ? Number(row.points) : 10,
    evalMode: row.eval_mode || 'Automatic',
    usage: row.usage_count != null ? Number(row.usage_count) : 0,
    usageCount: row.usage_count != null ? Number(row.usage_count) : 0,
    author,
    date: dateCreated,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
    recruiterId: row.recruiter_id,

    // Raw payload object
    details,

    // Flattened helper properties for easier frontend rendering:
    // Multiple Choice
    options: details.options || [],
    correctIndex: details.correctIndex != null ? details.correctIndex : null,
    explanation: details.explanation || '',

    // Coding
    language: details.language || '',
    boilerplate: details.boilerplate || '',
    inputFormat: details.inputFormat || '',
    outputFormat: details.outputFormat || '',
    constraints: details.constraints || '',
    testCases: details.testCases || [],
    sampleTestCases: details.sampleTestCases || details.testCases || [],
    hiddenTestCount: details.hiddenTestCount || 0,

    // Open-ended / Short answer
    modelAnswer: details.modelAnswer || '',
    rubric: details.rubric || details.rubricItems || [],
  };
};

/**
 * Generates the next sequential question code (e.g., Q-1001, Q-1002...).
 */
const generateNextQuestionCode = async (executor = db) => {
  const result = await executor.query(`
    SELECT question_code 
    FROM questions 
    WHERE question_code ~ '^Q-[0-9]+$' 
    ORDER BY LENGTH(question_code) DESC, question_code DESC 
    LIMIT 1
  `);

  let nextNum = 1001;
  if (result.rows.length > 0 && result.rows[0].question_code) {
    const match = result.rows[0].question_code.match(/^Q-(\d+)$/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `Q-${nextNum}`;
};

/**
 * Creates a new question in the database.
 */
const createQuestion = async (data, userId = null, recruiterId = null, executor = db) => {
  const code = data.questionCode || (await generateNextQuestionCode(executor));

  const title = (data.title || data.questionText || 'Untitled Question').trim();
  const prompt = (data.prompt || data.questionText || title).trim();
  const category = data.category || 'General';
  const section = data.section || 'Section 2: Technical Concepts';
  const jobRole = data.jobRole || data.role || null;
  const difficulty = data.difficulty || 'Medium';
  const type = data.type || data.questionType || 'Multiple Choice';
  const status = data.status || 'Published';
  const points = data.points != null ? parseInt(data.points, 10) : 10;
  const evalMode = data.evalMode || 'Automatic';
  const usageCount = data.usageCount != null ? parseInt(data.usageCount, 10) : 0;

  // Process skills array
  const skillsJson = JSON.stringify(Array.isArray(data.skills) ? data.skills : []);

  // Construct structured details JSONB payload based on question type
  let details = data.details || {};
  if (typeof details === 'string') {
    try {
      details = JSON.parse(details);
    } catch (e) {
      details = {};
    }
  }

  // Merge any top-level form fields into details payload
  if (type === 'Multiple Choice' || type === 'MCQ') {
    details = {
      ...details,
      options: data.options || details.options || [],
      correctIndex: data.correctIndex != null ? data.correctIndex : (data.correctIdx != null ? data.correctIdx : details.correctIndex ?? 0),
      explanation: data.explanation || details.explanation || '',
    };
  } else if (type === 'Coding') {
    details = {
      ...details,
      language: data.language || details.language || 'JavaScript',
      boilerplate: data.boilerplate || details.boilerplate || '',
      inputFormat: data.inputFormat || details.inputFormat || '',
      outputFormat: data.outputFormat || details.outputFormat || '',
      constraints: data.constraints || details.constraints || '',
      testCases: data.testCases || details.testCases || [],
      sampleTestCases: data.sampleTestCases || details.sampleTestCases || data.testCases || [],
      hiddenTestCount: data.hiddenTestCount != null ? data.hiddenTestCount : (details.hiddenTestCount || 0),
    };
  } else {
    // Open Ended / Short Answer
    details = {
      ...details,
      modelAnswer: data.modelAnswer || details.modelAnswer || '',
      rubric: data.rubric || data.rubricItems || details.rubric || [],
    };
  }

  const detailsJson = JSON.stringify(details);

  const query = `
    INSERT INTO questions (
      question_code,
      user_id,
      recruiter_id,
      title,
      prompt,
      category,
      section,
      job_role,
      skills,
      difficulty,
      type,
      status,
      points,
      eval_mode,
      usage_count,
      details,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
    )
    RETURNING *;
  `;

  const values = [
    code,
    userId,
    recruiterId,
    title,
    prompt,
    category,
    section,
    jobRole,
    skillsJson,
    difficulty,
    type,
    status,
    points,
    evalMode,
    usageCount,
    detailsJson,
  ];

  const result = await executor.query(query, values);
  return formatQuestionRow(result.rows[0]);
};

/**
 * Finds a single question by ID (integer) or question_code (e.g., Q-1001).
 */
const findQuestionByIdOrCode = async (identifier) => {
  const isNumeric = /^\d+$/.test(String(identifier));

  const query = `
    SELECT q.*, u.full_name AS author_name, r.company_name
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN recruiters r ON q.recruiter_id = r.id
    WHERE ${isNumeric ? 'q.id = $1 OR q.question_code = $2' : 'q.question_code = $1'}
  `;

  const values = isNumeric ? [parseInt(identifier, 10), String(identifier)] : [String(identifier)];
  const result = await db.query(query, values);

  if (result.rows.length === 0) return null;
  return formatQuestionRow(result.rows[0]);
};

/**
 * Lists questions with flexible filtering, searching, and pagination.
 */
const findAllQuestions = async (filters = {}) => {
  const {
    recruiterId = null,
    userId = null,
    search = '',
    category = null,
    section = null,
    type = null,
    difficulty = null,
    status = null,
    jobRole = null,
    sortBy = 'dateDesc',
    limit = 50,
    offset = 0,
  } = filters;

  const conditions = [];
  const values = [];

  if (recruiterId) {
    values.push(recruiterId);
    conditions.push(`q.recruiter_id = $${values.length}`);
  } else if (userId) {
    values.push(userId);
    conditions.push(`q.user_id = $${values.length}`);
  }

  if (category && category !== 'All') {
    values.push(category);
    conditions.push(`LOWER(q.category) = LOWER($${values.length})`);
  }

  if (section && section !== 'All') {
    values.push(section);
    conditions.push(`LOWER(q.section) = LOWER($${values.length})`);
  }

  if (type && type !== 'All') {
    values.push(type);
    conditions.push(`LOWER(q.type) = LOWER($${values.length})`);
  }

  if (difficulty && difficulty !== 'All') {
    values.push(difficulty);
    conditions.push(`LOWER(q.difficulty) = LOWER($${values.length})`);
  }

  if (status && status !== 'All') {
    values.push(status);
    conditions.push(`LOWER(q.status) = LOWER($${values.length})`);
  }

  if (jobRole && jobRole !== 'All') {
    values.push(jobRole);
    conditions.push(`LOWER(q.job_role) = LOWER($${values.length})`);
  }

  if (search && search.trim()) {
    values.push(`%${search.trim().toLowerCase()}%`);
    conditions.push(`(
      LOWER(q.title) LIKE $${values.length} OR 
      LOWER(q.prompt) LIKE $${values.length} OR 
      LOWER(q.category) LIKE $${values.length} OR 
      LOWER(q.question_code) LIKE $${values.length} OR
      LOWER(COALESCE(q.job_role, '')) LIKE $${values.length}
    )`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'ORDER BY q.created_at DESC';
  if (sortBy === 'dateAsc') orderBy = 'ORDER BY q.created_at ASC';
  else if (sortBy === 'titleAsc') orderBy = 'ORDER BY q.title ASC';
  else if (sortBy === 'titleDesc') orderBy = 'ORDER BY q.title DESC';
  else if (sortBy === 'usageDesc') orderBy = 'ORDER BY q.usage_count DESC';
  else if (sortBy === 'difficultyAsc') orderBy = 'ORDER BY q.difficulty ASC';

  // Count total matching questions for pagination
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM questions q
    ${whereClause}
  `;
  const countResult = await db.query(countQuery, values);
  const total = parseInt(countResult.rows[0].total, 10);

  // Fetch paginated rows
  const query = `
    SELECT q.*, u.full_name AS author_name, r.company_name
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN recruiters r ON q.recruiter_id = r.id
    ${whereClause}
    ${orderBy}
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const queryValues = [...values, limit, offset];
  const result = await db.query(query, queryValues);

  return {
    questions: result.rows.map(row => formatQuestionRow(row)),
    total,
    page: Math.floor(offset / limit) + 1,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Updates an existing question by its ID or question_code.
 */
const updateQuestion = async (identifier, data, executor = db) => {
  const existing = await findQuestionByIdOrCode(identifier);
  if (!existing) return null;

  const title = (data.title || data.questionText || existing.title).trim();
  const prompt = (data.prompt || data.questionText || existing.prompt).trim();
  const category = data.category || existing.category;
  const section = data.section || existing.section;
  const jobRole = data.jobRole !== undefined ? data.jobRole : (data.role !== undefined ? data.role : existing.jobRole);
  const difficulty = data.difficulty || existing.difficulty;
  const type = data.type || data.questionType || existing.type;
  const status = data.status || existing.status;
  const points = data.points != null ? parseInt(data.points, 10) : existing.points;
  const evalMode = data.evalMode || existing.evalMode;
  const usageCount = data.usageCount != null ? parseInt(data.usageCount, 10) : existing.usageCount;

  const skillsJson = data.skills
    ? JSON.stringify(Array.isArray(data.skills) ? data.skills : [])
    : JSON.stringify(existing.skills);

  // Merge details
  let details = { ...existing.details, ...(data.details || {}) };
  if (type === 'Multiple Choice' || type === 'MCQ') {
    if (data.options) details.options = data.options;
    if (data.correctIndex != null) details.correctIndex = data.correctIndex;
    if (data.correctIdx != null) details.correctIndex = data.correctIdx;
    if (data.explanation !== undefined) details.explanation = data.explanation;
  } else if (type === 'Coding') {
    if (data.language) details.language = data.language;
    if (data.boilerplate !== undefined) details.boilerplate = data.boilerplate;
    if (data.inputFormat !== undefined) details.inputFormat = data.inputFormat;
    if (data.outputFormat !== undefined) details.outputFormat = data.outputFormat;
    if (data.constraints !== undefined) details.constraints = data.constraints;
    if (data.testCases) details.testCases = data.testCases;
  } else {
    if (data.modelAnswer !== undefined) details.modelAnswer = data.modelAnswer;
    if (data.rubric || data.rubricItems) details.rubric = data.rubric || data.rubricItems;
  }

  const detailsJson = JSON.stringify(details);

  const query = `
    UPDATE questions
    SET 
      title = $1,
      prompt = $2,
      category = $3,
      section = $4,
      job_role = $5,
      skills = $6,
      difficulty = $7,
      type = $8,
      status = $9,
      points = $10,
      eval_mode = $11,
      usage_count = $12,
      details = $13,
      updated_at = NOW()
    WHERE id = $14
    RETURNING *;
  `;

  const values = [
    title,
    prompt,
    category,
    section,
    jobRole,
    skillsJson,
    difficulty,
    type,
    status,
    points,
    evalMode,
    usageCount,
    detailsJson,
    existing.numericId,
  ];

  const result = await executor.query(query, values);
  return formatQuestionRow(result.rows[0]);
};

/**
 * Deletes a question by its ID or question_code.
 */
const deleteQuestion = async (identifier, executor = db) => {
  const isNumeric = /^\d+$/.test(String(identifier));

  const query = `
    DELETE FROM questions
    WHERE ${isNumeric ? 'id = $1 OR question_code = $2' : 'question_code = $1'}
    RETURNING id, question_code;
  `;

  const values = isNumeric ? [parseInt(identifier, 10), String(identifier)] : [String(identifier)];
  const result = await executor.query(query, values);

  return result.rows.length > 0;
};

/**
 * Retrieves aggregate statistics for questions.
 */
const getQuestionStats = async () => {
  const result = await db.query(`
    SELECT 
      COUNT(*) AS total_questions,
      COUNT(*) FILTER (WHERE difficulty = 'Easy') AS easy_count,
      COUNT(*) FILTER (WHERE difficulty = 'Medium') AS medium_count,
      COUNT(*) FILTER (WHERE difficulty = 'Hard') AS hard_count,
      COUNT(*) FILTER (WHERE type = 'Multiple Choice' OR type = 'MCQ') AS mcq_count,
      COUNT(*) FILTER (WHERE type = 'Coding') AS coding_count,
      COUNT(*) FILTER (WHERE type = 'Open Ended' OR type = 'Short Answer') AS open_ended_count
    FROM questions;
  `);

  return result.rows[0] || {};
};

module.exports = {
  formatQuestionRow,
  generateNextQuestionCode,
  createQuestion,
  findQuestionByIdOrCode,
  findAllQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionStats,
};

