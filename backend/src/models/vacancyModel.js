const db = require('../config/db');

/**
 * Formats a raw DB row to camelCase and formats expected by the frontend.
 */
const formatVacancyRow = (row, user = null, recruiter = null) => {
  if (!row) return null;

  const dateCreated = row.created_at
    ? new Date(row.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const requirements = Array.isArray(row.qualifications)
    ? row.qualifications
    : typeof row.qualifications === 'string'
    ? row.qualifications.split('\n').filter(Boolean)
    : [];

  const hiringManager =
    row.hiring_manager_name ||
    (user ? user.full_name : null) ||
    (recruiter ? recruiter.company_name : 'Hiring Team');

  return {
    id: row.vacancy_code || String(row.id),
    numericId: row.id,
    vacancyCode: row.vacancy_code,
    title: row.title,
    jobTitle: row.title,
    department: row.department,
    category: row.department,
    status: row.status || 'draft',
    dateCreated,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    location: row.location || 'Remote',
    employmentType: row.job_type || 'Full-Time',
    jobType: row.job_type || 'full-time',
    workMode: row.work_mode || 'remote',
    salaryRange:
      row.salary_range ||
      (row.salary_min && row.salary_max
        ? `$${Number(row.salary_min).toLocaleString()} – $${Number(row.salary_max).toLocaleString()}`
        : 'Competitive'),
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    hiringManager,
    description: row.description || '',
    requirements,
    qualifications: row.qualifications || [],
    responsibilities: Array.isArray(row.responsibilities) ? row.responsibilities : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
    openings: row.openings || 1,
    experienceLevel: row.experience_level || 'senior',
    deadline: row.deadline,
    shortlistCount: row.shortlist_count,
    requireAssessmentTest: row.require_assessment_test || false,
    milestones: Array.isArray(row.milestones) ? row.milestones : [],
    attendees: Array.isArray(row.attendees) ? row.attendees : [],
    panels: Array.isArray(row.panels) ? row.panels : [],
    adminReviews: Array.isArray(row.admin_reviews) ? row.admin_reviews : [],
    approvalHistory: Array.isArray(row.approval_history) ? row.approval_history : [],
    activityLog: Array.isArray(row.activity_log) ? row.activity_log : [],
    timeToFill: row.time_to_fill || null,
    userId: row.user_id,
    recruiterId: row.recruiter_id,
  };
};

/**
 * Generates the next sequential vacancy code (e.g., VAC-001, VAC-002).
 */
const generateNextVacancyCode = async (client = null) => {
  const executor = client || db;
  const result = await executor.query(`
    SELECT vacancy_code 
    FROM vacancies 
    WHERE vacancy_code ~ '^VAC-[0-9]+$' 
    ORDER BY LENGTH(vacancy_code) DESC, vacancy_code DESC 
    LIMIT 1
  `);

  let nextNum = 1;
  if (result.rows.length > 0 && result.rows[0].vacancy_code) {
    const match = result.rows[0].vacancy_code.match(/^VAC-(\d+)$/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `VAC-${String(nextNum).padStart(3, '0')}`;
};

/**
 * Creates a new vacancy record.
 */
const createVacancy = async (data, userId = null, recruiterId = null) => {
  const code = data.vacancyCode || (await generateNextVacancyCode());

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const title = data.jobTitle || data.title || 'Untitled Vacancy';
  const description = data.jobDescription || data.description || '';
  const department = data.category || data.department || 'General';
  const location = data.selectedLocation || data.location || 'Remote';
  const workMode = data.workMode || 'remote';
  const jobType = data.jobType || 'full-time';
  const experienceLevel = data.experienceLevel || 'senior';
  const openings = parseInt(data.openings, 10) || 1;
  const salaryMin = data.salaryMin ? Number(data.salaryMin) : null;
  const salaryMax = data.salaryMax ? Number(data.salaryMax) : null;
  const salaryRange =
    data.salaryRange ||
    (salaryMin && salaryMax
      ? `$${salaryMin.toLocaleString()} – $${salaryMax.toLocaleString()}`
      : null);
  const deadline = data.deadline ? new Date(data.deadline) : null;
  const shortlistCount = data.shortlistCount ? parseInt(data.shortlistCount, 10) : null;
  const requireAssessmentTest =
    data.requireAssessmentTest === 'yes' || data.requireAssessmentTest === true;

  const skills = JSON.stringify(data.skills || []);
  const responsibilities = JSON.stringify(
    Array.isArray(data.responsibilities)
      ? data.responsibilities.filter(Boolean)
      : []
  );

  let qualifications = [];
  if (Array.isArray(data.qualifications)) {
    qualifications = data.qualifications;
  } else if (typeof data.qualifications === 'string') {
    qualifications = data.qualifications.split('\n').filter(Boolean);
  }
  const qualificationsJson = JSON.stringify(qualifications);

  const milestones = JSON.stringify(data.milestones || []);
  const attendees = JSON.stringify(data.attendees || []);
  const panels = JSON.stringify(data.panels || []);
  const adminReviews = JSON.stringify(data.adminReviews || []);

  const status = data.status || 'draft';

  const approvalHistory = JSON.stringify(
    data.approvalHistory || [
      { step: 'Submitted', state: 'done', timestamp: formattedDate },
      {
        step: 'Manager Review',
        state: status === 'published' ? 'done' : 'current',
        timestamp: status === 'published' ? formattedDate : null,
      },
      {
        step: 'HR Review',
        state: status === 'published' ? 'done' : 'pending',
        timestamp: status === 'published' ? formattedDate : null,
      },
      {
        step: 'Published',
        state: status === 'published' ? 'done' : 'pending',
        timestamp: status === 'published' ? formattedDate : null,
      },
    ]
  );

  const initialActivity = [
    { id: `l-${Date.now()}`, text: 'Vacancy created', timestamp: formattedDate },
  ];
  if (status === 'published') {
    initialActivity.push({
      id: `l-${Date.now() + 1}`,
      text: 'Vacancy published',
      timestamp: formattedDate,
    });
  }
  const activityLog = JSON.stringify(data.activityLog || initialActivity);

  const query = `
    INSERT INTO vacancies (
      vacancy_code, user_id, recruiter_id, title, description, department, location,
      work_mode, job_type, experience_level, openings, salary_min, salary_max, salary_range,
      deadline, shortlist_count, require_assessment_test, skills, responsibilities,
      qualifications, milestones, attendees, panels, admin_reviews, approval_history,
      activity_log, status, created_at, updated_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
      $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
      $27, NOW(), NOW()
    )
    RETURNING *;
  `;

  const values = [
    code,
    userId,
    recruiterId,
    title,
    description,
    department,
    location,
    workMode,
    jobType,
    experienceLevel,
    openings,
    salaryMin,
    salaryMax,
    salaryRange,
    deadline,
    shortlistCount,
    requireAssessmentTest,
    skills,
    responsibilities,
    qualificationsJson,
    milestones,
    attendees,
    panels,
    adminReviews,
    approvalHistory,
    activityLog,
    status,
  ];

  const result = await db.query(query, values);
  return formatVacancyRow(result.rows[0]);
};

/**
 * Finds a vacancy by ID (numeric) or vacancy_code (e.g. VAC-001).
 */
const findVacancyByIdOrCode = async (identifier) => {
  const isNumeric = /^\d+$/.test(String(identifier));

  const query = `
    SELECT v.*, u.full_name AS hiring_manager_name, r.company_name
    FROM vacancies v
    LEFT JOIN users u ON v.user_id = u.id
    LEFT JOIN recruiters r ON v.recruiter_id = r.id
    WHERE ${isNumeric ? 'v.id = $1 OR v.vacancy_code = $2' : 'v.vacancy_code = $1'}
  `;

  const values = isNumeric ? [parseInt(identifier, 10), String(identifier)] : [String(identifier)];
  const result = await db.query(query, values);

  if (result.rows.length === 0) return null;
  return formatVacancyRow(result.rows[0]);
};

/**
 * Fetches all vacancies with optional search, filtering, and sorting.
 */
const findAllVacancies = async (filters = {}) => {
  const {
    recruiterId = null,
    userId = null,
    status = null,
    department = null,
    search = '',
    sortBy = 'dateDesc',
    limit = 50,
    offset = 0,
  } = filters;

  const conditions = [];
  const values = [];

  if (recruiterId) {
    values.push(recruiterId);
    conditions.push(`v.recruiter_id = $${values.length}`);
  } else if (userId) {
    values.push(userId);
    conditions.push(`v.user_id = $${values.length}`);
  }

  if (status && status !== 'all') {
    values.push(status);
    conditions.push(`LOWER(v.status) = LOWER($${values.length})`);
  }

  if (department && department !== 'all') {
    values.push(department);
    conditions.push(`LOWER(v.department) = LOWER($${values.length})`);
  }

  if (search && search.trim()) {
    values.push(`%${search.trim().toLowerCase()}%`);
    conditions.push(`(
      LOWER(v.title) LIKE $${values.length} OR 
      LOWER(v.department) LIKE $${values.length} OR 
      LOWER(v.vacancy_code) LIKE $${values.length} OR 
      LOWER(v.location) LIKE $${values.length}
    )`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'ORDER BY v.created_at DESC';
  if (sortBy === 'dateAsc') orderBy = 'ORDER BY v.created_at ASC';
  else if (sortBy === 'titleAsc') orderBy = 'ORDER BY v.title ASC';
  else if (sortBy === 'titleDesc') orderBy = 'ORDER BY v.title DESC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM vacancies v
    ${whereClause}
  `;
  const countResult = await db.query(countQuery, values);
  const total = parseInt(countResult.rows[0].total, 10);

  const query = `
    SELECT v.*, u.full_name AS hiring_manager_name, r.company_name
    FROM vacancies v
    LEFT JOIN users u ON v.user_id = u.id
    LEFT JOIN recruiters r ON v.recruiter_id = r.id
    ${whereClause}
    ${orderBy}
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  values.push(limit, offset);
  const result = await db.query(query, values);

  return {
    vacancies: result.rows.map((row) => formatVacancyRow(row)),
    total,
  };
};

/**
 * Updates a vacancy.
 */
const updateVacancy = async (identifier, updateData) => {
  const vacancy = await findVacancyByIdOrCode(identifier);
  if (!vacancy) return null;

  const fields = [];
  const values = [];

  const updateable = {
    title: updateData.jobTitle || updateData.title,
    description: updateData.jobDescription || updateData.description,
    department: updateData.category || updateData.department,
    location: updateData.selectedLocation || updateData.location,
    work_mode: updateData.workMode,
    job_type: updateData.jobType,
    experience_level: updateData.experienceLevel,
    openings: updateData.openings ? parseInt(updateData.openings, 10) : undefined,
    salary_min: updateData.salaryMin ? Number(updateData.salaryMin) : undefined,
    salary_max: updateData.salaryMax ? Number(updateData.salaryMax) : undefined,
    salary_range: updateData.salaryRange,
    deadline: updateData.deadline ? new Date(updateData.deadline) : undefined,
    shortlist_count: updateData.shortlistCount ? parseInt(updateData.shortlistCount, 10) : undefined,
    require_assessment_test:
      updateData.requireAssessmentTest !== undefined
        ? updateData.requireAssessmentTest === 'yes' || updateData.requireAssessmentTest === true
        : undefined,
    status: updateData.status,
  };

  Object.entries(updateable).forEach(([key, val]) => {
    if (val !== undefined) {
      values.push(val);
      fields.push(`${key} = $${values.length}`);
    }
  });

  if (updateData.skills) {
    values.push(JSON.stringify(updateData.skills));
    fields.push(`skills = $${values.length}`);
  }

  if (updateData.responsibilities) {
    values.push(JSON.stringify(updateData.responsibilities));
    fields.push(`responsibilities = $${values.length}`);
  }

  if (updateData.qualifications) {
    const qualArray = Array.isArray(updateData.qualifications)
      ? updateData.qualifications
      : typeof updateData.qualifications === 'string'
      ? updateData.qualifications.split('\n').filter(Boolean)
      : [];
    values.push(JSON.stringify(qualArray));
    fields.push(`qualifications = $${values.length}`);
  }

  if (updateData.milestones) {
    values.push(JSON.stringify(updateData.milestones));
    fields.push(`milestones = $${values.length}`);
  }

  if (updateData.attendees) {
    values.push(JSON.stringify(updateData.attendees));
    fields.push(`attendees = $${values.length}`);
  }

  if (updateData.panels) {
    values.push(JSON.stringify(updateData.panels));
    fields.push(`panels = $${values.length}`);
  }

  if (updateData.adminReviews) {
    values.push(JSON.stringify(updateData.adminReviews));
    fields.push(`admin_reviews = $${values.length}`);
  }

  if (updateData.activityLog) {
    values.push(JSON.stringify(updateData.activityLog));
    fields.push(`activity_log = $${values.length}`);
  }

  if (fields.length === 0) return vacancy;

  fields.push('updated_at = NOW()');
  values.push(vacancy.numericId);

  const query = `
    UPDATE vacancies
    SET ${fields.join(', ')}
    WHERE id = $${values.length}
    RETURNING *;
  `;

  const result = await db.query(query, values);
  return formatVacancyRow(result.rows[0]);
};

/**
 * Closes a vacancy.
 */
const closeVacancy = async (identifier) => {
  const vacancy = await findVacancyByIdOrCode(identifier);
  if (!vacancy) return null;

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const updatedLog = [
    ...(vacancy.activityLog || []),
    { id: `l-${Date.now()}`, text: 'Vacancy closed', timestamp: formattedDate },
  ];

  const result = await db.query(
    `
    UPDATE vacancies
    SET status = 'closed', activity_log = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
    `,
    [JSON.stringify(updatedLog), vacancy.numericId]
  );

  return formatVacancyRow(result.rows[0]);
};

module.exports = {
  formatVacancyRow,
  generateNextVacancyCode,
  createVacancy,
  findVacancyByIdOrCode,
  findAllVacancies,
  updateVacancy,
  closeVacancy,
};
