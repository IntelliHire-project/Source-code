const db = require('../config/db');

// Predefined core job roles for mock interviews
const DEFAULT_ROLES = [
  {
    id: 'backend',
    roleId: 'backend',
    title: 'Backend Developer',
    description: 'System architecture, API design, database management, and server-side logic scaling.',
    category: 'engineering',
    icon: 'Database',
    isCustom: false,
    skills: ['Node.js', 'Express', 'SQL', 'System Design', 'REST APIs', 'PostgreSQL'],
  },
  {
    id: 'frontend',
    roleId: 'frontend',
    title: 'Frontend Developer',
    description: 'Building responsive user interfaces, state management, and seamless UX implementation.',
    category: 'engineering',
    icon: 'MonitorPlay',
    isCustom: false,
    skills: ['React', 'JavaScript', 'CSS', 'HTML', 'State Management', 'Web Performance'],
  },
  {
    id: 'uiux',
    roleId: 'uiux',
    title: 'UI/UX Designer',
    description: 'Visual storytelling, user research, wireframing, and creating high-fidelity prototypes.',
    category: 'design',
    icon: 'Palette',
    isCustom: false,
    skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
  },
  {
    id: 'qa',
    roleId: 'qa',
    title: 'QA Engineer',
    description: 'Automated testing, quality assurance frameworks, and ensuring bug-free product delivery.',
    category: 'qa',
    icon: 'ShieldCheck',
    isCustom: false,
    skills: ['Automated Testing', 'Jest', 'Cypress', 'Playwright', 'Test Planning', 'API Testing'],
  },
  {
    id: 'data',
    roleId: 'data',
    title: 'Data Analyst',
    description: 'Statistical modeling, data visualization, and extracting actionable business insights.',
    category: 'data',
    icon: 'BarChart3',
    isCustom: false,
    skills: ['SQL', 'Python', 'Data Visualization', 'Tableau', 'Statistical Modeling'],
  },
];

// Predefined role categories
const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'design', label: 'Design' },
  { id: 'data', label: 'Data & Analytics' },
  { id: 'qa', label: 'QA & Testing' },
];

/**
 * Checks if a given role is a system default role (non-deletable).
 */
const isSystemDefaultRole = (role) => {
  if (!role) return false;
  if (role.isCustom === false || role.is_custom === false) return true;
  const defaultIds = DEFAULT_ROLES.map((r) => r.id.toLowerCase());
  const targetId = String(role.roleId || role.id || '').toLowerCase();
  return defaultIds.includes(targetId);
};

/**
 * Formats a raw database row to standard camelCase object.
 */
const formatRoleRow = (row) => {
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
    id: row.role_id || String(row.id),
    numericId: row.id,
    roleId: row.role_id,
    title: row.title,
    description: row.description || '',
    category: row.category || 'engineering',
    icon: row.icon || 'Sparkles',
    isCustom: Boolean(row.is_custom),
    userId: row.user_id || null,
    skills,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
};

/**
 * Helper to generate a unique slug or role identifier.
 */
const generateRoleId = (title, isCustom = true) => {
  if (!title) return `custom-${Date.now()}`;
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (!slug) return `custom-${Date.now()}`;
  return isCustom ? `custom-${slug}-${Date.now().toString().slice(-4)}` : slug;
};

/**
 * Finds a job role by exact title (case-insensitive) for duplicate prevention.
 */
const findJobRoleByTitle = async (title, excludeIdOrRoleId = null, executor = db) => {
  if (!title || !title.trim()) return null;
  const normalizedTitle = title.trim().toLowerCase();

  try {
    let query = `SELECT * FROM mock_interview_roles WHERE LOWER(TRIM(title)) = $1`;
    const params = [normalizedTitle];

    if (excludeIdOrRoleId) {
      params.push(String(excludeIdOrRoleId));
      query += ` AND role_id != $2 AND CAST(id AS TEXT) != $2`;
    }

    query += ` LIMIT 1;`;
    const result = await executor.query(query, params);
    if (result && result.rows && result.rows.length > 0) {
      return formatRoleRow(result.rows[0]);
    }
  } catch (err) {
    console.warn('Database query failed in findJobRoleByTitle, falling back to in-memory check:', err.message);
  }

  // Fallback to DEFAULT_ROLES
  const defaultFound = DEFAULT_ROLES.find(
    (r) =>
      r.title.toLowerCase() === normalizedTitle &&
      (!excludeIdOrRoleId || (r.id !== excludeIdOrRoleId && r.roleId !== excludeIdOrRoleId))
  );
  return defaultFound ? { ...defaultFound } : null;
};

/**
 * Creates a new Job Role for Mock Interview with validation and duplicate prevention.
 */
const createJobRole = async (data = {}, user = null, executor = db) => {
  const title = (data.title || '').trim();
  if (!title) {
    const error = new Error('Role title is required.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Duplicate title validation
  const existingRoleWithTitle = await findJobRoleByTitle(title, null, executor);
  if (existingRoleWithTitle) {
    const error = new Error(`A job role with the title "${title}" already exists.`);
    error.statusCode = 409;
    throw error;
  }

  const isUserAdmin = user && user.role === 'admin';
  const isCustom = data.isCustom !== undefined && isUserAdmin ? Boolean(data.isCustom) : true;
  const roleId = (data.roleId || data.id || generateRoleId(title, isCustom)).trim();
  const description = (
    data.description || 'Custom role defined by you for a personalised mock interview experience.'
  ).trim();
  const category = (data.category || 'engineering').toLowerCase().trim();
  const icon = (data.icon || (isCustom ? 'Sparkles' : 'Database')).trim();
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const assignedUserId = user ? user.id : data.userId || null;

  try {
    const query = `
      INSERT INTO mock_interview_roles (role_id, title, description, category, icon, is_custom, user_id, skills)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
      RETURNING *;
    `;
    const values = [
      roleId,
      title,
      description,
      category,
      icon,
      isCustom,
      assignedUserId,
      JSON.stringify(skills),
    ];
    const result = await executor.query(query, values);
    return formatRoleRow(result.rows[0]);
  } catch (err) {
    // Unique violation handling for PostgreSQL (code 23505)
    if (err.code === '23505') {
      const error = new Error(`A job role with the identifier "${roleId}" already exists.`);
      error.statusCode = 409;
      throw error;
    }
    // Graceful fallback for mock/offline environments
    console.warn('Database query failed in createJobRole, using in-memory response:', err.message);
    return {
      id: roleId,
      numericId: Date.now(),
      roleId,
      title,
      description,
      category,
      icon,
      isCustom,
      userId: assignedUserId,
      skills,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
};

/**
 * Retrieves job roles with advanced search, filtering, and sorting.
 */
const findAllJobRoles = async (filters = {}, executor = db) => {
  const {
    search,
    category,
    userId,
    isCustom,
    sortBy = 'default',
    page,
    limit,
    includeShared = true,
  } = filters;

  try {
    let query = `SELECT * FROM mock_interview_roles WHERE 1=1`;
    const params = [];

    // Filter by category
    if (category && category !== 'all') {
      params.push(category.toLowerCase().trim());
      query += ` AND LOWER(category) = $${params.length}`;
    }

    // Filter by search query (title, description, or skills)
    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIdx = params.length;
      query += ` AND (
        LOWER(title) LIKE $${pIdx} 
        OR LOWER(description) LIKE $${pIdx}
        OR EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(skills) AS elem 
          WHERE LOWER(elem) LIKE $${pIdx}
        )
      )`;
    }

    // Filter by isCustom boolean
    if (isCustom !== undefined && isCustom !== null) {
      params.push(Boolean(isCustom));
      query += ` AND is_custom = $${params.length}`;
    }

    // Scoped visibility: show system roles + caller's custom roles
    if (userId) {
      params.push(userId);
      const uIdx = params.length;
      if (includeShared) {
        query += ` AND (is_custom = false OR user_id IS NULL OR user_id = $${uIdx})`;
      } else {
        query += ` AND user_id = $${uIdx}`;
      }
    } else if (includeShared === false) {
      query += ` AND is_custom = false`;
    }

    // Sorting
    switch (sortBy) {
      case 'titleAsc':
        query += ` ORDER BY title ASC`;
        break;
      case 'titleDesc':
        query += ` ORDER BY title DESC`;
        break;
      case 'newest':
        query += ` ORDER BY created_at DESC`;
        break;
      case 'popular':
      case 'default':
      default:
        query += ` ORDER BY is_custom ASC, id ASC`;
        break;
    }

    // Pagination
    let offset = 0;
    let limitNum = null;
    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
      offset = (pageNum - 1) * limitNum;
      params.push(limitNum);
      query += ` LIMIT $${params.length}`;
      params.push(offset);
      query += ` OFFSET $${params.length}`;
    }

    const result = await executor.query(query, params);

    if (result && Array.isArray(result.rows)) {
      if (result.rows.length > 0) {
        return result.rows.map(formatRoleRow);
      }
      // If a specific filter was requested and no rows matched in the DB table, return empty array
      if (search || (category && category !== 'all') || isCustom !== undefined) {
        return [];
      }
    }
  } catch (err) {
    console.warn('Database query failed in findAllJobRoles, falling back to defaults:', err.message);
  }

  // Fallback to DEFAULT_ROLES if table is empty or DB is offline
  return DEFAULT_ROLES.filter((role) => {
    const matchesCategory = !category || category === 'all' || role.category === category.toLowerCase();
    const matchesSearch =
      !search ||
      role.title.toLowerCase().includes(search.toLowerCase()) ||
      role.description.toLowerCase().includes(search.toLowerCase()) ||
      (role.skills && role.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())));
    const matchesCustom = isCustom === undefined || role.isCustom === isCustom;
    return matchesCategory && matchesSearch && matchesCustom;
  });
};

/**
 * Retrieves a single job role by roleId or numeric id.
 */
const findJobRoleById = async (idOrRoleId, executor = db) => {
  if (!idOrRoleId) return null;
  const lookup = String(idOrRoleId).trim();

  try {
    const query = `
      SELECT * FROM mock_interview_roles
      WHERE role_id = $1 OR CAST(id AS TEXT) = $1
      LIMIT 1;
    `;
    const result = await executor.query(query, [lookup]);
    if (result && result.rows && result.rows.length > 0) {
      return formatRoleRow(result.rows[0]);
    }
  } catch (err) {
    console.warn('Database query failed in findJobRoleById, falling back to defaults:', err.message);
  }

  // Fallback lookup in DEFAULT_ROLES
  const defaultFound = DEFAULT_ROLES.find(
    (r) =>
      r.id.toLowerCase() === lookup.toLowerCase() ||
      r.roleId.toLowerCase() === lookup.toLowerCase() ||
      String(r.numericId) === lookup
  );
  return defaultFound ? { ...defaultFound } : null;
};

/**
 * Updates an existing job role with validation, system role protection, and ownership checks.
 */
const updateJobRole = async (idOrRoleId, data = {}, user = null, executor = db) => {
  const existing = await findJobRoleById(idOrRoleId, executor);
  if (!existing) {
    const error = new Error('Job role not found.');
    error.statusCode = 404;
    throw error;
  }

  const isUserAdmin = user && user.role === 'admin';

  // System role protection: Only administrators can modify default roles
  if (isSystemDefaultRole(existing) && !isUserAdmin) {
    const error = new Error('System default job roles can only be modified by an administrator.');
    error.statusCode = 403;
    throw error;
  }

  // Ownership validation for custom roles
  if (!isUserAdmin && user && existing.userId && String(existing.userId) !== String(user.id)) {
    const error = new Error('Access denied. You do not have permission to update this job role.');
    error.statusCode = 403;
    throw error;
  }

  const title = (data.title !== undefined ? data.title : existing.title).trim();
  const description = (data.description !== undefined ? data.description : existing.description).trim();
  const category = (data.category !== undefined ? data.category : existing.category).toLowerCase().trim();
  const icon = (data.icon !== undefined ? data.icon : existing.icon).trim();
  const skills = Array.isArray(data.skills) ? data.skills : existing.skills;

  // Duplicate title collision check when title is updated
  if (title.toLowerCase() !== existing.title.toLowerCase()) {
    const conflicting = await findJobRoleByTitle(title, idOrRoleId, executor);
    if (conflicting) {
      const error = new Error(`A job role with the title "${title}" already exists.`);
      error.statusCode = 409;
      throw error;
    }
  }

  try {
    const query = `
      UPDATE mock_interview_roles
      SET title = $1, description = $2, category = $3, icon = $4, skills = $5::jsonb, updated_at = NOW()
      WHERE role_id = $6 OR CAST(id AS TEXT) = $6
      RETURNING *;
    `;
    const values = [title, description, category, icon, JSON.stringify(skills), String(idOrRoleId)];
    const result = await executor.query(query, values);
    if (result && result.rows && result.rows.length > 0) {
      return formatRoleRow(result.rows[0]);
    }
  } catch (err) {
    console.warn('Database query failed in updateJobRole, returning merged:', err.message);
  }

  return {
    ...existing,
    title,
    description,
    category,
    icon,
    skills,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Deletes a job role with system default protection and user ownership validation.
 */
const deleteJobRole = async (idOrRoleId, user = null, executor = db) => {
  if (!idOrRoleId) {
    const error = new Error('Job role identifier is required.');
    error.statusCode = 400;
    throw error;
  }

  const existing = await findJobRoleById(idOrRoleId, executor);
  if (!existing) {
    const error = new Error('Job role not found.');
    error.statusCode = 404;
    throw error;
  }

  // System role protection: Default system roles CANNOT be deleted
  if (isSystemDefaultRole(existing)) {
    const error = new Error('System default job roles cannot be deleted.');
    error.statusCode = 403;
    throw error;
  }

  // Ownership validation: Only creator or admin can delete
  const isUserAdmin = user && user.role === 'admin';
  if (!isUserAdmin && user && existing.userId && String(existing.userId) !== String(user.id)) {
    const error = new Error('Access denied. You do not have permission to delete this job role.');
    error.statusCode = 403;
    throw error;
  }

  try {
    const query = `
      DELETE FROM mock_interview_roles
      WHERE role_id = $1 OR CAST(id AS TEXT) = $1;
    `;
    const result = await executor.query(query, [String(idOrRoleId)]);
    return (result.rowCount || 0) > 0;
  } catch (err) {
    console.warn('Database query failed in deleteJobRole:', err.message);
    return true;
  }
};

/**
 * Returns available job role categories enriched with dynamic role counts.
 */
const getJobRoleCategories = async (executor = db) => {
  try {
    const countQuery = `
      SELECT category, COUNT(*) as count 
      FROM mock_interview_roles 
      GROUP BY category;
    `;
    const totalQuery = `SELECT COUNT(*) as total FROM mock_interview_roles;`;

    const [countsResult, totalResult] = await Promise.all([
      executor.query(countQuery).catch(() => null),
      executor.query(totalQuery).catch(() => null),
    ]);

    const countMap = {};
    if (countsResult && countsResult.rows) {
      countsResult.rows.forEach((row) => {
        countMap[row.category.toLowerCase()] = parseInt(row.count, 10);
      });
    }

    const totalCount =
      totalResult && totalResult.rows && totalResult.rows[0]
        ? parseInt(totalResult.rows[0].total, 10)
        : DEFAULT_ROLES.length;
 
    return DEFAULT_CATEGORIES.map((cat) => {
      if (cat.id === 'all') {
        return { ...cat, count: totalCount };
      }
      return {
        ...cat,
        count: countMap[cat.id] || DEFAULT_ROLES.filter((r) => r.category === cat.id).length,
      };
    });
  } catch {
    return DEFAULT_CATEGORIES.map((cat) => {
      const count =
        cat.id === 'all'
          ? DEFAULT_ROLES.length
          : DEFAULT_ROLES.filter((r) => r.category === cat.id).length;
      return { ...cat, count };
    });
  }
};

/**
 * Fetches all available job roles for candidate mock interview preparation.
 * Returns default system roles plus any custom roles belonging to the current user or shared.
 */
const findAvailableJobRoles = async (filters = {}, executor = db) => {
  return findAllJobRoles({ ...filters, includeShared: true }, executor);
};

/**
 * Stores or updates the selected job role for a candidate's mock interview session.
 */
const storeSelectedRole = async (data = {}, userId = null, executor = db) => {
  const roleId = (data.roleId || data.id || '').trim();
  if (!roleId) {
    const error = new Error('Role identifier (roleId) is required.');
    error.statusCode = 400;
    throw error;
  }

  // Look up role details if not directly provided
  let roleTitle = (data.roleTitle || data.title || '').trim();
  let category = (data.category || '').toLowerCase().trim();
  if (!roleTitle) {
    const existingRole = await findJobRoleById(roleId, executor);
    if (existingRole) {
      roleTitle = existingRole.title;
      category = category || existingRole.category;
    } else {
      roleTitle = roleId;
    }
  }

  const jobDescription = (data.jobDescription || data.jd || '').trim();
  const interviewMode = (data.interviewMode || data.mode || 'text').trim();
  const status = 'selected';
  const assignedUserId = userId || data.userId || null;

  try {
    const query = `
      INSERT INTO mock_interview_selected_roles (user_id, role_id, role_title, category, job_description, interview_mode, status, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *;
    `;
    const values = [
      assignedUserId,
      roleId,
      roleTitle,
      category || 'engineering',
      jobDescription,
      interviewMode,
      status,
    ];
    const result = await executor.query(query, values);

    // If a job description was provided with the selected role submission, also store it in mock_interview_job_descriptions
    if (jobDescription) {
      try {
        await executor.query(
          `
            INSERT INTO mock_interview_job_descriptions 
              (user_id, role_id, title, job_description, experience_level, source, created_at, updated_at)
            VALUES ($1, $2, $3, $4, 'mid', 'role_selection_submission', NOW(), NOW());
          `,
          [assignedUserId, roleId, roleTitle, jobDescription]
        );
      } catch (jdErr) {
        console.warn('Could not mirror job description to mock_interview_job_descriptions:', jdErr.message);
      }
    }

    if (result && result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        roleId: row.role_id,
        roleTitle: row.role_title,
        category: row.category,
        jobDescription: row.job_description,
        interviewMode: row.interview_mode,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }
  } catch (err) {
    console.warn('Database query failed in storeSelectedRole, returning in-memory stored role:', err.message);
  }

  // Fallback in-memory representation
  return {
    id: Date.now(),
    userId: assignedUserId,
    roleId,
    roleTitle,
    category: category || 'engineering',
    jobDescription,
    interviewMode,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Retrieves the currently selected mock interview job role for a candidate.
 */
const getSelectedRole = async (userId = null, executor = db) => {
  if (userId) {
    try {
      const query = `
        SELECT * FROM mock_interview_selected_roles
        WHERE user_id = $1
        ORDER BY updated_at DESC, id DESC
        LIMIT 1;
      `;
      const result = await executor.query(query, [userId]);
      if (result && result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          roleId: row.role_id,
          roleTitle: row.role_title,
          category: row.category,
          jobDescription: row.job_description,
          interviewMode: row.interview_mode,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
    } catch (err) {
      console.warn('Database query failed in getSelectedRole:', err.message);
    }
  }
  return null;
};

/**
 * Clears the selected mock interview role for a candidate.
 */
const clearSelectedRole = async (userId = null, executor = db) => {
  if (!userId) return true;
  try {
    const query = `DELETE FROM mock_interview_selected_roles WHERE user_id = $1;`;
    const result = await executor.query(query, [userId]);
    return (result.rowCount || 0) > 0;
  } catch (err) {
    console.warn('Database query failed in clearSelectedRole:', err.message);
    return true;
  }
};

module.exports = {
  DEFAULT_ROLES,
  DEFAULT_CATEGORIES,
  isSystemDefaultRole,
  formatRoleRow,
  generateRoleId,
  findJobRoleByTitle,
  createJobRole,
  findAllJobRoles,
  findAvailableJobRoles,
  findJobRoleById,
  updateJobRole,
  deleteJobRole,
  getJobRoleCategories,
  storeSelectedRole,
  getSelectedRole,
  clearSelectedRole,
};
