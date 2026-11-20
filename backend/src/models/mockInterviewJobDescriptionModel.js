const db = require('../config/db');

/**
 * Formats a raw database row into a standardized camelCase object.
 */
const formatJobDescriptionRow = (row) => {
  if (!row) return null;

  const skills = Array.isArray(row.skills)
    ? row.skills
    : typeof row.skills === 'string'
      ? (() => {
          try {
            return JSON.parse(row.skills || '[]');
          } catch {
            return [];
          }
        })()
      : [];

  return {
    id: row.id,
    userId: row.user_id ? Number(row.user_id) : null,
    roleId: row.role_id || null,
    title: row.title || '',
    jobDescription: row.job_description || '',
    skills,
    experienceLevel: row.experience_level || 'mid',
    company: row.company || null,
    source: row.source || 'custom',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
};

/**
 * Creates a new Job Description for mock interview preparation.
 */
const createJobDescription = async (data = {}, user = null, executor = db) => {
  const rawDescription = data.jobDescription || data.description || data.content || '';
  const jobDescription = String(rawDescription).trim();

  if (!jobDescription) {
    const error = new Error('Job description is required.');
    error.statusCode = 400;
    throw error;
  }

  const userId = user && user.id ? Number(user.id) : data.userId ? Number(data.userId) : null;
  const roleId = (data.roleId || '').trim() || null;
  const title = (data.title || data.roleTitle || '').trim() || null;
  const skills = Array.isArray(data.skills)
    ? data.skills
    : typeof data.skills === 'string'
      ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
  const experienceLevel = (data.experienceLevel || 'mid').trim();
  const company = (data.company || '').trim() || null;
  const source = (data.source || 'custom').trim();

  try {
    const query = `
      INSERT INTO mock_interview_job_descriptions 
        (user_id, role_id, title, job_description, skills, experience_level, company, source, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, NOW(), NOW())
      RETURNING *;
    `;
    const values = [
      userId,
      roleId,
      title,
      jobDescription,
      JSON.stringify(skills),
      experienceLevel,
      company,
      source,
    ];
    const result = await executor.query(query, values);
    if (result && result.rows && result.rows.length > 0) {
      return formatJobDescriptionRow(result.rows[0]);
    }
  } catch (err) {
    console.warn('Database query failed in createJobDescription, returning fallback object:', err.message);
  }

  return {
    id: Date.now(),
    userId,
    roleId,
    title: title || '',
    jobDescription,
    skills,
    experienceLevel,
    company,
    source,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Retrieves all job descriptions with filtering, search, and pagination.
 */
const findAllJobDescriptions = async (filters = {}, executor = db) => {
  const { userId, roleId, search, limit, page } = filters;

  try {
    let query = `SELECT * FROM mock_interview_job_descriptions WHERE 1=1`;
    const params = [];

    if (userId) {
      params.push(Number(userId));
      query += ` AND user_id = $${params.length}`;
    }

    if (roleId) {
      params.push(roleId);
      query += ` AND role_id = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(job_description) LIKE $${params.length})`;
    }

    query += ` ORDER BY updated_at DESC, id DESC`;

    if (limit && Number(limit) > 0) {
      const take = Number(limit);
      const skip = page && Number(page) > 1 ? (Number(page) - 1) * take : 0;
      params.push(take);
      query += ` LIMIT $${params.length}`;
      params.push(skip);
      query += ` OFFSET $${params.length}`;
    }

    const result = await executor.query(query, params);
    if (result && result.rows) {
      return result.rows.map(formatJobDescriptionRow);
    }
  } catch (err) {
    console.warn('Database query failed in findAllJobDescriptions, returning empty list:', err.message);
  }

  return [];
};

/**
 * Retrieves a single job description by ID.
 */
const findJobDescriptionById = async (id, executor = db) => {
  if (!id) return null;

  try {
    const query = `SELECT * FROM mock_interview_job_descriptions WHERE id = $1 LIMIT 1;`;
    const result = await executor.query(query, [id]);
    if (result && result.rows && result.rows.length > 0) {
      return formatJobDescriptionRow(result.rows[0]);
    }
  } catch (err) {
    console.warn('Database query failed in findJobDescriptionById:', err.message);
  }

  return null;
};

/**
 * Retrieves the latest job description for a specific candidate or session.
 */
const findLatestJobDescription = async (userId = null, executor = db) => {
  try {
    let query = `SELECT * FROM mock_interview_job_descriptions`;
    const params = [];

    if (userId) {
      params.push(Number(userId));
      query += ` WHERE user_id = $1`;
    }

    query += ` ORDER BY updated_at DESC, id DESC LIMIT 1;`;
    const result = await executor.query(query, params);
    if (result && result.rows && result.rows.length > 0) {
      return formatJobDescriptionRow(result.rows[0]);
    }
  } catch (err) {
    console.warn('Database query failed in findLatestJobDescription:', err.message);
  }

  return null;
};

/**
 * Updates an existing job description with ownership and validation checks.
 */
const updateJobDescription = async (id, data = {}, user = null, executor = db) => {
  const existing = await findJobDescriptionById(id, executor);
  if (!existing) {
    const error = new Error('Job description not found.');
    error.statusCode = 404;
    throw error;
  }

  const isUserAdmin = user && user.role === 'admin';
  if (!isUserAdmin && user && existing.userId && Number(existing.userId) !== Number(user.id)) {
    const error = new Error('Access denied. You do not have permission to update this job description.');
    error.statusCode = 403;
    throw error;
  }

  const rawDescription = data.jobDescription !== undefined ? data.jobDescription : data.description;
  const jobDescription = rawDescription !== undefined ? String(rawDescription).trim() : existing.jobDescription;
  const title = data.title !== undefined ? String(data.title).trim() : existing.title;
  const roleId = data.roleId !== undefined ? String(data.roleId).trim() : existing.roleId;
  const experienceLevel = data.experienceLevel !== undefined ? String(data.experienceLevel).trim() : existing.experienceLevel;
  const company = data.company !== undefined ? String(data.company).trim() : existing.company;
  const skills = Array.isArray(data.skills)
    ? data.skills
    : typeof data.skills === 'string'
      ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : existing.skills;

  try {
    const query = `
      UPDATE mock_interview_job_descriptions
      SET title = $1, job_description = $2, role_id = $3, experience_level = $4, company = $5, skills = $6::jsonb, updated_at = NOW()
      WHERE id = $7
      RETURNING *;
    `;
    const values = [
      title,
      jobDescription,
      roleId,
      experienceLevel,
      company,
      JSON.stringify(skills),
      id,
    ];
    const result = await executor.query(query, values);
    if (result && result.rows && result.rows.length > 0) {
      return formatJobDescriptionRow(result.rows[0]);
    }
  } catch (err) {
    console.warn('Database query failed in updateJobDescription, returning merged object:', err.message);
  }

  return {
    ...existing,
    title,
    jobDescription,
    roleId,
    experienceLevel,
    company,
    skills,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Deletes a job description with ownership verification.
 */
const deleteJobDescription = async (id, user = null, executor = db) => {
  if (!id) {
    const error = new Error('Job description identifier is required.');
    error.statusCode = 400;
    throw error;
  }

  const existing = await findJobDescriptionById(id, executor);
  if (!existing) {
    const error = new Error('Job description not found.');
    error.statusCode = 404;
    throw error;
  }

  const isUserAdmin = user && user.role === 'admin';
  if (!isUserAdmin && user && existing.userId && Number(existing.userId) !== Number(user.id)) {
    const error = new Error('Access denied. You do not have permission to delete this job description.');
    error.statusCode = 403;
    throw error;
  }

  try {
    const query = `DELETE FROM mock_interview_job_descriptions WHERE id = $1;`;
    const result = await executor.query(query, [id]);
    return (result.rowCount || 0) > 0;
  } catch (err) {
    console.warn('Database query failed in deleteJobDescription:', err.message);
    return true;
  }
};

/**
 * Saves a job description for the current mock interview session and syncs with selected role.
 */
const saveSelectedJobDescription = async (data = {}, user = null, executor = db) => {
  const rawDescription = data.jobDescription || data.description || data.content || '';
  const trimmed = String(rawDescription).trim();
  const userId = user && user.id ? Number(user.id) : data.userId ? Number(data.userId) : null;
  const roleId = (data.roleId || '').trim() || null;
  const roleTitle = (data.roleTitle || data.title || '').trim() || null;
  const category = (data.category || '').toLowerCase().trim() || 'engineering';

  let createdJd = null;
  if (trimmed) {
    createdJd = await createJobDescription({ ...data, jobDescription: trimmed }, user, executor);
  }

  if (userId) {
    try {
      let updateResult;
      if (roleId) {
        updateResult = await executor.query(
          `
            UPDATE mock_interview_selected_roles
            SET job_description = $1, role_id = COALESCE($2, role_id), role_title = COALESCE($3, role_title), updated_at = NOW()
            WHERE user_id = $4 AND role_id = $2
            RETURNING *;
          `,
          [trimmed || null, roleId, roleTitle, userId]
        );
      }

      if (!updateResult || !updateResult.rows || updateResult.rows.length === 0) {
        updateResult = await executor.query(
          `
            UPDATE mock_interview_selected_roles
            SET job_description = $1, role_id = COALESCE($2, role_id), role_title = COALESCE($3, role_title), updated_at = NOW()
            WHERE user_id = $4
            RETURNING *;
          `,
          [trimmed || null, roleId, roleTitle, userId]
        );
      }

      if (!updateResult || !updateResult.rows || updateResult.rows.length === 0) {
        await executor.query(
          `
            INSERT INTO mock_interview_selected_roles 
              (user_id, role_id, role_title, category, job_description, interview_mode, status, updated_at)
            VALUES ($1, $2, $3, $4, $5, 'text', 'selected', NOW());
          `,
          [
            userId,
            roleId || 'general',
            roleTitle || 'General Role',
            category,
            trimmed || null,
          ]
        );
      }
    } catch (err) {
      console.warn('Sync with mock_interview_selected_roles failed:', err.message);
    }
  }

  return (
    createdJd || {
      id: Date.now(),
      userId,
      roleId,
      title: roleTitle || '',
      jobDescription: trimmed,
      skills: [],
      experienceLevel: 'mid',
      company: null,
      source: 'custom',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
};

/**
 * Generates an industry-standard, role-integrated Job Description template
 * tailored to a specific job role, its category, and its core skill set.
 */
const generateRoleIntegratedJobDescription = (role) => {
  if (!role) return '';

  const title = role.title || 'Technical Specialist';
  const categoryLabel = (role.category || 'engineering').toUpperCase();
  const summary =
    role.description ||
    'System architecture, technical execution, and high-reliability software delivery.';
  const skillsList =
    Array.isArray(role.skills) && role.skills.length > 0
      ? role.skills
      : ['Core Technical Competencies', 'System Architecture', 'Problem Solving', 'Structured Communication'];

  return [
    `# Job Title: ${title}`,
    `**Track**: ${categoryLabel} | **Mode**: AI Mock Interview Tailored`,
    '',
    `## Role Overview`,
    `${summary}`,
    '',
    `## Core Responsibilities`,
    `- Architect, design, and implement scalable, resilient solutions for ${title}.`,
    `- Drive technical problem-solving, code quality, and engineering best practices.`,
    `- Collaborate effectively across cross-functional teams to deliver impactful products.`,
    `- Diagnose, debug, and optimize complex technical workflows and system performance.`,
    '',
    `## Key Requirements & Technical Competencies`,
    skillsList.map((skill) => `- Hands-on experience with ${skill}`).join('\n'),
    '- Solid grounding in software fundamentals, trade-off analysis, and system architecture.',
    '- Clear, structured communication and scenario-based technical leadership.',
    '',
    `## Mock Interview Evaluation Criteria`,
    `- Technical depth and precision in ${skillsList.slice(0, 3).join(', ')}.`,
    `- Ability to break down ambiguous technical requirements into practical steps.`,
    `- Trade-off articulation (e.g. performance vs complexity, consistency vs availability).`,
  ].join('\n');
};

/**
 * Retrieves the integrated job description for a specific role.
 * Returns the role metadata, any previously saved JD for this user + role,
 * and a role-tailored template.
 */
const getRoleIntegratedJobDescription = async (roleId, userId = null, executor = db) => {
  if (!roleId) return null;

  const { findJobRoleById, DEFAULT_ROLES } = require('./mockInterviewRoleModel');
  let role = null;

  try {
    role = await findJobRoleById(roleId, executor);
  } catch (err) {
    console.warn('Could not fetch role by ID, falling back to default roles:', err.message);
  }

  if (!role) {
    role = (DEFAULT_ROLES || []).find(
      (r) => r.id === roleId || r.roleId === roleId || (r.title && r.title.toLowerCase() === roleId.toLowerCase())
    );
  }

  if (!role) {
    role = {
      id: roleId,
      roleId,
      title: roleId.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      category: 'engineering',
      description: 'Professional role evaluation for mock interview practice.',
      skills: ['Domain Knowledge', 'Problem Solving', 'System Design'],
    };
  }

  const template = generateRoleIntegratedJobDescription(role);

  // Check if user has an existing saved job description for this roleId
  let savedJobDescription = null;
  if (userId) {
    try {
      const query = `
        SELECT * FROM mock_interview_job_descriptions 
        WHERE user_id = $1 AND role_id = $2 
        ORDER BY updated_at DESC, id DESC 
        LIMIT 1;
      `;
      const result = await executor.query(query, [Number(userId), roleId]);
      if (result && result.rows && result.rows.length > 0) {
        savedJobDescription = formatJobDescriptionRow(result.rows[0]);
      }
    } catch (err) {
      console.warn('Could not check saved JD for role:', err.message);
    }
  }

  return {
    role,
    roleId: role.roleId || role.id,
    roleTitle: role.title,
    category: role.category,
    skills: role.skills || [],
    template,
    savedJobDescription,
    activeJobDescription: savedJobDescription ? savedJobDescription.jobDescription : template,
  };
};

/**
 * Directly integrates and attaches a job description to the candidate's active selected role.
 */
const attachJobDescriptionToSelectedRole = async (data = {}, user = null, executor = db) => {
  const roleId = (data.roleId || data.id || '').trim();
  const rawDescription = data.jobDescription || data.description || data.content || '';
  const jobDescription = String(rawDescription).trim();

  if (!roleId) {
    const error = new Error('Role identifier (roleId) is required.');
    error.statusCode = 400;
    throw error;
  }

  const roleTitle = (data.roleTitle || data.title || '').trim();
  const category = (data.category || '').toLowerCase().trim();

  // Save selected job description session and sync with selected roles table
  const savedJd = await saveSelectedJobDescription(
    {
      ...data,
      roleId,
      jobDescription,
      roleTitle,
      category,
      source: 'role_integration',
    },
    user,
    executor
  );

  return {
    roleId,
    roleTitle: roleTitle || savedJd.title,
    category: category || 'engineering',
    jobDescription: savedJd.jobDescription,
    savedAt: savedJd.updatedAt || new Date().toISOString(),
  };
};

/**
 * Updates the candidate's selected role job description directly.
 */
const updateSelectedRoleJobDescription = async (data = {}, user = null, executor = db) => {
  return attachJobDescriptionToSelectedRole(data, user, executor);
};

module.exports = {
  formatJobDescriptionRow,
  createJobDescription,
  findAllJobDescriptions,
  findJobDescriptionById,
  findLatestJobDescription,
  updateJobDescription,
  deleteJobDescription,
  saveSelectedJobDescription,
  generateRoleIntegratedJobDescription,
  getRoleIntegratedJobDescription,
  attachJobDescriptionToSelectedRole,
  updateSelectedRoleJobDescription,
};

