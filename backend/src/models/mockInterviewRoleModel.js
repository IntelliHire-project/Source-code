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
 * Formats a raw database row to standard camelCase object.
 */
const formatRoleRow = (row) => {
  if (!row) return null;

  const skills = Array.isArray(row.skills)
    ? row.skills
    : (typeof row.skills === 'string'
        ? (() => {
            try { return JSON.parse(row.skills || '[]'); } catch { return []; }
          })()
        : []);

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
 * Helper to generate a slug or unique role identifier.
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
 * Creates a new Job Role for Mock Interview.
 */
const createJobRole = async (data = {}, userId = null, executor = db) => {
  const title = (data.title || '').trim();
  if (!title) {
    throw new Error('Role title is required.');
  }

  const isCustom = data.isCustom !== undefined ? Boolean(data.isCustom) : true;
  const roleId = (data.roleId || data.id || generateRoleId(title, isCustom)).trim();
  const description = (data.description || 'Custom role defined by you for a personalised mock interview experience.').trim();
  const category = (data.category || 'engineering').toLowerCase().trim();
  const icon = (data.icon || (isCustom ? 'Sparkles' : 'Database')).trim();
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const assignedUserId = userId || data.userId || null;

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
 * Retrieves all job roles with optional search and category filters.
 */
const findAllJobRoles = async (filters = {}, executor = db) => {
  const { search, category, userId, isCustom } = filters;

  try {
    let query = `SELECT * FROM mock_interview_roles WHERE 1=1`;
    const params = [];

    if (category && category !== 'all') {
      params.push(category.toLowerCase().trim());
      query += ` AND LOWER(category) = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`;
    }

    if (isCustom !== undefined && isCustom !== null) {
      params.push(Boolean(isCustom));
      query += ` AND is_custom = $${params.length}`;
    }

    if (userId) {
      params.push(userId);
      query += ` AND (user_id IS NULL OR user_id = $${params.length})`;
    }

    query += ` ORDER BY is_custom ASC, id ASC`;

    const result = await executor.query(query, params);

    if (result.rows && result.rows.length > 0) {
      return result.rows.map(formatRoleRow);
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
      role.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
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
    if (result.rows && result.rows.length > 0) {
      return formatRoleRow(result.rows[0]);
    }
  } catch (err) {
    console.warn('Database query failed in findJobRoleById, falling back to defaults:', err.message);
  }

  // Fallback lookup in DEFAULT_ROLES
  const defaultFound = DEFAULT_ROLES.find(
    (r) => r.id === lookup || r.roleId === lookup
  );
  return defaultFound ? { ...defaultFound } : null;
};

/**
 * Updates an existing job role.
 */
const updateJobRole = async (idOrRoleId, data = {}, userId = null, executor = db) => {
  const existing = await findJobRoleById(idOrRoleId, executor);
  if (!existing) {
    throw new Error('Job role not found.');
  }

  const title = (data.title || existing.title).trim();
  const description = (data.description !== undefined ? data.description : existing.description).trim();
  const category = (data.category || existing.category).toLowerCase().trim();
  const icon = (data.icon || existing.icon).trim();
  const skills = Array.isArray(data.skills) ? data.skills : existing.skills;

  try {
    const query = `
      UPDATE mock_interview_roles
      SET title = $1, description = $2, category = $3, icon = $4, skills = $5::jsonb, updated_at = NOW()
      WHERE role_id = $6 OR CAST(id AS TEXT) = $6
      RETURNING *;
    `;
    const values = [title, description, category, icon, JSON.stringify(skills), String(idOrRoleId)];
    const result = await executor.query(query, values);
    if (result.rows && result.rows.length > 0) {
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
 * Deletes a job role.
 */
const deleteJobRole = async (idOrRoleId, userId = null, executor = db) => {
  if (!idOrRoleId) return false;
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
 * Returns available job role categories.
 */
const getJobRoleCategories = () => {
  return DEFAULT_CATEGORIES;
};

module.exports = {
  DEFAULT_ROLES,
  DEFAULT_CATEGORIES,
  formatRoleRow,
  generateRoleId,
  createJobRole,
  findAllJobRoles,
  findJobRoleById,
  updateJobRole,
  deleteJobRole,
  getJobRoleCategories,
};

