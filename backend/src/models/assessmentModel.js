const db = require('../config/db');

/**
 * Formats a raw database row into camelCase and frontend-compatible properties.
 */
const formatAssessmentRow = (row, authorName = null) => {
  if (!row) return null;

  let questions = [];
  if (Array.isArray(row.questions)) {
    questions = row.questions;
  } else if (typeof row.questions === 'string') {
    try {
      questions = JSON.parse(row.questions || '[]');
    } catch {
      questions = [];
    }
  }

  let settings = {};
  if (typeof row.settings === 'object' && row.settings !== null) {
    settings = row.settings;
  } else if (typeof row.settings === 'string') {
    try {
      settings = JSON.parse(row.settings || '{}');
    } catch {
      settings = {};
    }
  }

  const author = authorName || row.author_name || row.recruiter_name || 'IntelliHire Recruiter';
  const company = row.company_name || 'IntelliHire';
  const vacancyTitle = row.vacancy_title || row.job_role || '';

  // Sum total points if not already stored or if questions changed
  const calculatedPoints = Array.isArray(questions)
    ? questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0)
    : 0;
  const totalPoints = row.total_points != null ? Number(row.total_points) : calculatedPoints;

  return {
    id: row.assessment_code || String(row.id),
    numericId: row.id,
    assessmentCode: row.assessment_code,
    title: row.title,
    name: row.title, // Frontend compatibility alias
    description: row.description || '',
    jobRole: row.job_role || '',
    role: row.job_role || '', // Frontend compatibility alias
    vacancy: vacancyTitle,
    vacancyId: row.vacancy_id || null,
    userId: row.user_id || null,
    recruiterId: row.recruiter_id || null,
    difficulty: row.difficulty || 'Mid-level',
    duration: row.duration != null ? Number(row.duration) : 60,
    passingScore: row.passing_score != null ? Number(row.passing_score) : 70,
    passing: row.passing_score != null ? Number(row.passing_score) : 70, // Frontend compatibility alias
    totalPoints,
    totalQ: questions.length, // Frontend compatibility alias
    questionsCount: questions.length,
    status: row.status || 'Draft',
    questions,
    settings,
    author,
    company,
    invited: row.invited_count != null ? Number(row.invited_count) : 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Generates the next sequential assessment code (e.g., A-1001, A-1002...).
 */
const generateNextAssessmentCode = async (executor = db) => {
  try {
    const result = await executor.query(`
      SELECT assessment_code 
      FROM assessments 
      WHERE assessment_code ~ '^A-[0-9]+$' 
      ORDER BY LENGTH(assessment_code) DESC, assessment_code DESC 
      LIMIT 1
    `);

    let nextNum = 1001;
    if (result.rows && result.rows.length > 0 && result.rows[0].assessment_code) {
      const match = result.rows[0].assessment_code.match(/^A-(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    return `A-${nextNum}`;
  } catch (err) {
    return `A-${Date.now().toString().slice(-4)}`;
  }
};

/**
 * Creates a new assessment in the database.
 */
const createAssessment = async (data, userId = null, recruiterId = null, executor = db) => {
  if (!data || !data.title || !data.title.trim()) {
    const error = new Error('Assessment title is required');
    error.statusCode = 400;
    throw error;
  }

  const code = data.assessmentCode || (await generateNextAssessmentCode(executor));
  const title = data.title.trim();
  const description = (data.description || '').trim();
  const jobRole = (data.jobRole || data.role || '').trim() || null;
  const vacancyId = data.vacancyId != null ? parseInt(data.vacancyId, 10) : null;
  const difficulty = data.difficulty || 'Mid-level';
  const duration = data.duration != null ? parseInt(data.duration, 10) : 60;
  const passingScore = data.passingScore != null ? parseInt(data.passingScore, 10) : (data.passing != null ? parseInt(data.passing, 10) : 70);
  const status = data.status || 'Draft';

  const questionsList = Array.isArray(data.questions) ? data.questions : [];
  const calculatedPoints = questionsList.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  const totalPoints = data.totalPoints != null ? parseInt(data.totalPoints, 10) : calculatedPoints;

  const questionsJson = JSON.stringify(questionsList);
  const settingsJson = JSON.stringify(typeof data.settings === 'object' && data.settings !== null ? data.settings : {});

  const query = `
    INSERT INTO assessments (
      assessment_code,
      user_id,
      recruiter_id,
      vacancy_id,
      title,
      description,
      job_role,
      difficulty,
      duration,
      passing_score,
      total_points,
      status,
      questions,
      settings,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
    )
    RETURNING *;
  `;

  const values = [
    code,
    userId,
    recruiterId,
    vacancyId,
    title,
    description,
    jobRole,
    difficulty,
    duration,
    passingScore,
    totalPoints,
    status,
    questionsJson,
    settingsJson,
  ];

  const result = await executor.query(query, values);
  return formatAssessmentRow(result.rows[0]);
};

/**
 * Finds a single assessment by ID (integer) or assessment_code (e.g., A-1001).
 */
const findAssessmentByIdOrCode = async (identifier, executor = db) => {
  if (!identifier) return null;

  const isNumeric = /^\d+$/.test(String(identifier).trim());
  const strId = String(identifier).trim();

  const query = `
    SELECT 
      a.*, 
      u.full_name AS author_name, 
      r.company_name,
      v.title AS vacancy_title
    FROM assessments a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN recruiters r ON a.recruiter_id = r.id
    LEFT JOIN vacancies v ON a.vacancy_id = v.id
    WHERE ${isNumeric ? 'a.id = $1 OR a.assessment_code = $2' : 'a.assessment_code = $1'}
  `;

  const values = isNumeric ? [parseInt(strId, 10), strId] : [strId];
  const result = await executor.query(query, values);

  if (!result.rows || result.rows.length === 0) return null;
  return formatAssessmentRow(result.rows[0]);
};

/**
 * Lists assessments with flexible filtering, searching, and pagination.
 */
const findAllAssessments = async (filters = {}, executor = db) => {
  const {
    recruiterId = null,
    userId = null,
    vacancyId = null,
    search = '',
    difficulty = null,
    status = null,
    jobRole = null,
    sortBy = 'newest',
    limit = 50,
    offset = 0,
  } = filters;

  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (recruiterId != null) {
    conditions.push(`a.recruiter_id = $${paramIndex}`);
    values.push(recruiterId);
    paramIndex += 1;
  }

  if (userId != null && recruiterId == null) {
    conditions.push(`a.user_id = $${paramIndex}`);
    values.push(userId);
    paramIndex += 1;
  }

  if (vacancyId != null) {
    conditions.push(`a.vacancy_id = $${paramIndex}`);
    values.push(vacancyId);
    paramIndex += 1;
  }

  if (status && status !== 'All') {
    conditions.push(`LOWER(a.status) = LOWER($${paramIndex})`);
    values.push(status);
    paramIndex += 1;
  }

  if (difficulty && difficulty !== 'All') {
    conditions.push(`LOWER(a.difficulty) = LOWER($${paramIndex})`);
    values.push(difficulty);
    paramIndex += 1;
  }

  if (jobRole && jobRole !== 'All') {
    conditions.push(`LOWER(a.job_role) = LOWER($${paramIndex})`);
    values.push(jobRole);
    paramIndex += 1;
  }

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    conditions.push(`(
      LOWER(a.title) LIKE $${paramIndex} OR
      LOWER(COALESCE(a.description, '')) LIKE $${paramIndex} OR
      LOWER(COALESCE(a.job_role, '')) LIKE $${paramIndex} OR
      LOWER(COALESCE(a.assessment_code, '')) LIKE $${paramIndex}
    )`);
    values.push(term);
    paramIndex += 1;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'a.created_at DESC';
  if (sortBy === 'oldest') orderBy = 'a.created_at ASC';
  else if (sortBy === 'titleAsc') orderBy = 'a.title ASC';
  else if (sortBy === 'titleDesc') orderBy = 'a.title DESC';
  else if (sortBy === 'durationAsc') orderBy = 'a.duration ASC';
  else if (sortBy === 'durationDesc') orderBy = 'a.duration DESC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM assessments a
    ${whereClause}
  `;
  const countResult = await executor.query(countQuery, values);
  const total = parseInt(countResult.rows[0].total, 10);

  const query = `
    SELECT 
      a.*, 
      u.full_name AS author_name, 
      r.company_name,
      v.title AS vacancy_title
    FROM assessments a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN recruiters r ON a.recruiter_id = r.id
    LEFT JOIN vacancies v ON a.vacancy_id = v.id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  values.push(Math.max(1, parseInt(limit, 10) || 50));
  values.push(Math.max(0, parseInt(offset, 10) || 0));

  const result = await executor.query(query, values);
  const assessments = result.rows.map((row) => formatAssessmentRow(row));

  return {
    assessments,
    total,
    limit: parseInt(limit, 10) || 50,
    offset: parseInt(offset, 10) || 0,
  };
};

/**
 * Updates an existing assessment.
 */
const updateAssessment = async (identifier, updates, userId = null, recruiterId = null, executor = db) => {
  const existing = await findAssessmentByIdOrCode(identifier, executor);
  if (!existing) {
    const error = new Error('Assessment not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify ownership if recruiterId or userId provided
  if (recruiterId != null && existing.recruiterId && existing.recruiterId !== recruiterId) {
    const error = new Error('You do not have permission to edit this assessment');
    error.statusCode = 403;
    throw error;
  } else if (userId != null && existing.userId && existing.userId !== userId && !recruiterId) {
    const error = new Error('You do not have permission to edit this assessment');
    error.statusCode = 403;
    throw error;
  }

  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    if (!updates.title.trim()) {
      const error = new Error('Assessment title cannot be empty');
      error.statusCode = 400;
      throw error;
    }
    fields.push(`title = $${paramIndex++}`);
    values.push(updates.title.trim());
  }

  if (updates.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(updates.description ? updates.description.trim() : '');
  }

  if (updates.jobRole !== undefined || updates.role !== undefined) {
    fields.push(`job_role = $${paramIndex++}`);
    values.push((updates.jobRole || updates.role || '').trim() || null);
  }

  if (updates.vacancyId !== undefined) {
    fields.push(`vacancy_id = $${paramIndex++}`);
    values.push(updates.vacancyId != null ? parseInt(updates.vacancyId, 10) : null);
  }

  if (updates.difficulty !== undefined) {
    fields.push(`difficulty = $${paramIndex++}`);
    values.push(updates.difficulty);
  }

  if (updates.duration !== undefined) {
    fields.push(`duration = $${paramIndex++}`);
    values.push(parseInt(updates.duration, 10));
  }

  if (updates.passingScore !== undefined || updates.passing !== undefined) {
    fields.push(`passing_score = $${paramIndex++}`);
    values.push(parseInt(updates.passingScore ?? updates.passing, 10));
  }

  if (updates.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }

  if (updates.questions !== undefined) {
    const questionsList = Array.isArray(updates.questions) ? updates.questions : [];
    fields.push(`questions = $${paramIndex++}`);
    values.push(JSON.stringify(questionsList));

    // Recalculate total points
    const calculatedPoints = questionsList.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    const totalPoints = updates.totalPoints != null ? parseInt(updates.totalPoints, 10) : calculatedPoints;
    fields.push(`total_points = $${paramIndex++}`);
    values.push(totalPoints);
  } else if (updates.totalPoints !== undefined) {
    fields.push(`total_points = $${paramIndex++}`);
    values.push(parseInt(updates.totalPoints, 10));
  }

  if (updates.settings !== undefined) {
    fields.push(`settings = $${paramIndex++}`);
    values.push(JSON.stringify(typeof updates.settings === 'object' && updates.settings !== null ? updates.settings : {}));
  }

  if (fields.length === 0) {
    return existing;
  }

  fields.push(`updated_at = NOW()`);
  values.push(existing.numericId);

  const query = `
    UPDATE assessments
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *;
  `;

  const result = await executor.query(query, values);
  return formatAssessmentRow(result.rows[0]);
};

/**
 * Deletes an assessment by ID or code.
 */
const deleteAssessment = async (identifier, userId = null, recruiterId = null, executor = db) => {
  const existing = await findAssessmentByIdOrCode(identifier, executor);
  if (!existing) {
    const error = new Error('Assessment not found');
    error.statusCode = 404;
    throw error;
  }

  // Permission check
  if (recruiterId != null && existing.recruiterId && existing.recruiterId !== recruiterId) {
    const error = new Error('You do not have permission to delete this assessment');
    error.statusCode = 403;
    throw error;
  } else if (userId != null && existing.userId && existing.userId !== userId && !recruiterId) {
    const error = new Error('You do not have permission to delete this assessment');
    error.statusCode = 403;
    throw error;
  }

  await executor.query('DELETE FROM assessments WHERE id = $1', [existing.numericId]);
  return { success: true, deletedAssessment: existing };
};

/**
 * Retrieves aggregate metrics for assessments (useful for recruiter dashboard cards).
 */
const getAssessmentStats = async (recruiterId = null, executor = db) => {
  const conditions = [];
  const values = [];

  if (recruiterId != null) {
    conditions.push('recruiter_id = $1');
    values.push(recruiterId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE LOWER(status) = 'active') AS active,
      COUNT(*) FILTER (WHERE LOWER(status) = 'draft') AS draft,
      COUNT(*) FILTER (WHERE LOWER(status) = 'archived') AS archived
    FROM assessments
    ${whereClause}
  `;

  const result = await executor.query(query, values);
  const row = result.rows[0] || {};

  return {
    total: parseInt(row.total || 0, 10),
    active: parseInt(row.active || 0, 10),
    draft: parseInt(row.draft || 0, 10),
    archived: parseInt(row.archived || 0, 10),
  };
};

module.exports = {
  formatAssessmentRow,
  generateNextAssessmentCode,
  createAssessment,
  findAssessmentByIdOrCode,
  findAllAssessments,
  updateAssessment,
  deleteAssessment,
  getAssessmentStats,
};

