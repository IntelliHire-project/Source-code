const { errorResponse } = require('../utils/response');

const ALLOWED_CATEGORIES = ['engineering', 'design', 'data', 'qa'];

/**
 * Validates the payload for creating a new job role.
 */
const validateCreateRole = (req, res, next) => {
  const { title, category, description, skills, icon } = req.body || {};

  // 1. Role Title Validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    return errorResponse(res, 'Role title is required and must be a non-empty string.', 400);
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length < 2) {
    return errorResponse(res, 'Role title must be at least 2 characters long.', 400);
  }
  if (trimmedTitle.length > 100) {
    return errorResponse(res, 'Role title must not exceed 100 characters.', 400);
  }
  if (!/[a-zA-Z]/.test(trimmedTitle)) {
    return errorResponse(res, 'Role title must contain at least one alphabetic character.', 400);
  }

  // 2. Category Validation
  if (category !== undefined) {
    if (typeof category !== 'string' || !category.trim()) {
      return errorResponse(res, 'Category must be a non-empty string.', 400);
    }
    const normalizedCategory = category.trim().toLowerCase();
    if (normalizedCategory === 'all') {
      return errorResponse(
        res,
        "Category cannot be 'all'. Allowed categories are: " + ALLOWED_CATEGORIES.join(', '),
        400
      );
    }
    if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
      return errorResponse(
        res,
        `Invalid category '${category}'. Allowed categories are: ${ALLOWED_CATEGORIES.join(', ')}`,
        400
      );
    }
    req.body.category = normalizedCategory;
  }

  // 3. Description Validation
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      return errorResponse(res, 'Description must be a string.', 400);
    }
    if (description.trim().length > 1000) {
      return errorResponse(res, 'Description cannot exceed 1000 characters.', 400);
    }
  }

  // 4. Skills Validation
  if (skills !== undefined && skills !== null) {
    let parsedSkills = skills;
    if (typeof parsedSkills === 'string') {
      parsedSkills = parsedSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedSkills)) {
      return errorResponse(res, 'Skills must be an array of strings or a comma-separated string.', 400);
    }
    if (parsedSkills.length > 30) {
      return errorResponse(res, 'Cannot specify more than 30 skills for a single job role.', 400);
    }
    for (const skill of parsedSkills) {
      if (typeof skill !== 'string') {
        return errorResponse(res, 'Each skill must be a string.', 400);
      }
      if (skill.trim().length > 50) {
        return errorResponse(res, `Skill '${skill.slice(0, 25)}...' exceeds maximum length of 50 characters.`, 400);
      }
    }
    req.body.skills = parsedSkills.map((s) => s.trim()).filter(Boolean);
  }

  // 5. Icon Validation
  if (icon !== undefined && icon !== null) {
    if (typeof icon !== 'string' || !icon.trim()) {
      return errorResponse(res, 'Icon must be a valid string identifier.', 400);
    }
    if (icon.trim().length > 50) {
      return errorResponse(res, 'Icon identifier cannot exceed 50 characters.', 400);
    }
    req.body.icon = icon.trim();
  }

  req.body.title = trimmedTitle;
  return next();
};

/**
 * Validates the payload for updating an existing job role.
 */
const validateUpdateRole = (req, res, next) => {
  const { title, category, description, skills, icon } = req.body || {};

  if (!title && !category && description === undefined && skills === undefined && icon === undefined) {
    return errorResponse(res, 'At least one field to update must be provided.', 400);
  }

  // Validate title if present
  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      return errorResponse(res, 'Role title cannot be empty.', 400);
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 2) {
      return errorResponse(res, 'Role title must be at least 2 characters long.', 400);
    }
    if (trimmedTitle.length > 100) {
      return errorResponse(res, 'Role title must not exceed 100 characters.', 400);
    }
    if (!/[a-zA-Z]/.test(trimmedTitle)) {
      return errorResponse(res, 'Role title must contain at least one alphabetic character.', 400);
    }
    req.body.title = trimmedTitle;
  }

  // Validate category if present
  if (category !== undefined) {
    if (typeof category !== 'string' || !category.trim()) {
      return errorResponse(res, 'Category must be a non-empty string.', 400);
    }
    const normalizedCategory = category.trim().toLowerCase();
    if (normalizedCategory === 'all') {
      return errorResponse(
        res,
        "Category cannot be 'all'. Allowed categories are: " + ALLOWED_CATEGORIES.join(', '),
        400
      );
    }
    if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
      return errorResponse(
        res,
        `Invalid category '${category}'. Allowed categories are: ${ALLOWED_CATEGORIES.join(', ')}`,
        400
      );
    }
    req.body.category = normalizedCategory;
  }

  // Validate description if present
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      return errorResponse(res, 'Description must be a string.', 400);
    }
    if (description.trim().length > 1000) {
      return errorResponse(res, 'Description cannot exceed 1000 characters.', 400);
    }
    req.body.description = description.trim();
  }

  // Validate skills if present
  if (skills !== undefined && skills !== null) {
    let parsedSkills = skills;
    if (typeof parsedSkills === 'string') {
      parsedSkills = parsedSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedSkills)) {
      return errorResponse(res, 'Skills must be an array of strings or a comma-separated string.', 400);
    }
    if (parsedSkills.length > 30) {
      return errorResponse(res, 'Cannot specify more than 30 skills for a single job role.', 400);
    }
    for (const skill of parsedSkills) {
      if (typeof skill !== 'string') {
        return errorResponse(res, 'Each skill must be a string.', 400);
      }
      if (skill.trim().length > 50) {
        return errorResponse(res, `Skill '${skill.slice(0, 25)}...' exceeds maximum length of 50 characters.`, 400);
      }
    }
    req.body.skills = parsedSkills.map((s) => s.trim()).filter(Boolean);
  }

  // Validate icon if present
  if (icon !== undefined && icon !== null) {
    if (typeof icon !== 'string' || !icon.trim()) {
      return errorResponse(res, 'Icon must be a valid string identifier.', 400);
    }
    if (icon.trim().length > 50) {
      return errorResponse(res, 'Icon identifier cannot exceed 50 characters.', 400);
    }
    req.body.icon = icon.trim();
  }

  return next();
};

/**
 * Validates role-based access for mock interview operations.
 * Allows 'candidate', 'recruiter', and 'admin'. Rejects other unauthorized roles.
 */
const validateUserRoleAccess = (req, res, next) => {
  if (req.user && req.user.role) {
    const allowedRoles = ['candidate', 'recruiter', 'admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        'Access denied. Your user role does not have permission to manage mock interview roles.',
        403
      );
    }
  }
  return next();
};

/**
 * Validates the payload for creating a job description for mock interviews.
 */
const validateCreateJobDescription = (req, res, next) => {
  const { jobDescription, description, content, title, roleId, experienceLevel, skills } = req.body || {};
  const rawDescription = jobDescription || description || content;

  if (!rawDescription || typeof rawDescription !== 'string' || !rawDescription.trim()) {
    return errorResponse(res, 'Job description is required and must be a non-empty string.', 400);
  }

  const trimmedDescription = rawDescription.trim();
  if (trimmedDescription.length < 5) {
    return errorResponse(res, 'Job description must be at least 5 characters long.', 400);
  }

  if (trimmedDescription.length > 50000) {
    return errorResponse(res, 'Job description cannot exceed 50,000 characters.', 400);
  }

  if (title !== undefined && title !== null) {
    if (typeof title !== 'string') {
      return errorResponse(res, 'Title must be a string.', 400);
    }
    if (title.trim().length > 150) {
      return errorResponse(res, 'Title cannot exceed 150 characters.', 400);
    }
    req.body.title = title.trim();
  }

  if (roleId !== undefined && roleId !== null) {
    if (typeof roleId !== 'string') {
      return errorResponse(res, 'Role identifier (roleId) must be a string.', 400);
    }
    req.body.roleId = roleId.trim();
  }

  if (experienceLevel !== undefined && experienceLevel !== null) {
    if (typeof experienceLevel !== 'string') {
      return errorResponse(res, 'Experience level must be a string.', 400);
    }
    req.body.experienceLevel = experienceLevel.trim();
  }

  if (skills !== undefined && skills !== null) {
    let parsedSkills = skills;
    if (typeof parsedSkills === 'string') {
      parsedSkills = parsedSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedSkills)) {
      return errorResponse(res, 'Skills must be an array of strings or a comma-separated string.', 400);
    }
    req.body.skills = parsedSkills.map((s) => String(s).trim()).filter(Boolean);
  }

  req.body.jobDescription = trimmedDescription;
  return next();
};

/**
 * Validates the payload for updating an existing job description.
 */
const validateUpdateJobDescription = (req, res, next) => {
  const { jobDescription, description, content, title, roleId, experienceLevel, skills, company } = req.body || {};
  const rawDescription =
    jobDescription !== undefined ? jobDescription : description !== undefined ? description : content;

  if (
    rawDescription === undefined &&
    title === undefined &&
    roleId === undefined &&
    experienceLevel === undefined &&
    skills === undefined &&
    company === undefined
  ) {
    return errorResponse(res, 'At least one field to update must be provided.', 400);
  }

  if (rawDescription !== undefined) {
    if (typeof rawDescription !== 'string' || !rawDescription.trim()) {
      return errorResponse(res, 'Job description cannot be empty.', 400);
    }
    const trimmedDescription = rawDescription.trim();
    if (trimmedDescription.length < 5) {
      return errorResponse(res, 'Job description must be at least 5 characters long.', 400);
    }
    if (trimmedDescription.length > 50000) {
      return errorResponse(res, 'Job description cannot exceed 50,000 characters.', 400);
    }
    req.body.jobDescription = trimmedDescription;
  }

  if (title !== undefined && title !== null) {
    if (typeof title !== 'string' || !title.trim()) {
      return errorResponse(res, 'Title cannot be empty.', 400);
    }
    if (title.trim().length > 150) {
      return errorResponse(res, 'Title cannot exceed 150 characters.', 400);
    }
    req.body.title = title.trim();
  }

  if (roleId !== undefined && roleId !== null) {
    if (typeof roleId !== 'string') {
      return errorResponse(res, 'Role identifier (roleId) must be a string.', 400);
    }
    req.body.roleId = roleId.trim();
  }

  if (experienceLevel !== undefined && experienceLevel !== null) {
    if (typeof experienceLevel !== 'string') {
      return errorResponse(res, 'Experience level must be a string.', 400);
    }
    req.body.experienceLevel = experienceLevel.trim();
  }

  if (skills !== undefined && skills !== null) {
    let parsedSkills = skills;
    if (typeof parsedSkills === 'string') {
      parsedSkills = parsedSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedSkills)) {
      return errorResponse(res, 'Skills must be an array of strings or a comma-separated string.', 400);
    }
    req.body.skills = parsedSkills.map((s) => String(s).trim()).filter(Boolean);
  }

  return next();
};

/**
 * Validates the payload for submitting/saving a job description in a mock interview session.
 * Providing a specific job description is optional (allowing standard questions if skipped).
 * If provided, enforces string formatting and maximum length.
 */
const validateSaveJobDescription = (req, res, next) => {
  const { jobDescription, description, content, title, roleId, experienceLevel, skills } = req.body || {};
  const rawDescription =
    jobDescription !== undefined ? jobDescription : description !== undefined ? description : content;

  if (rawDescription !== undefined && rawDescription !== null) {
    if (typeof rawDescription !== 'string') {
      return errorResponse(res, 'Job description must be a string.', 400);
    }
    const trimmed = rawDescription.trim();
    if (trimmed.length > 50000) {
      return errorResponse(res, 'Job description cannot exceed 50,000 characters.', 400);
    }
    req.body.jobDescription = trimmed;
  } else {
    req.body.jobDescription = '';
  }

  if (title !== undefined && title !== null) {
    if (typeof title !== 'string') {
      return errorResponse(res, 'Title must be a string.', 400);
    }
    req.body.title = title.trim();
  }

  if (roleId !== undefined && roleId !== null) {
    if (typeof roleId !== 'string') {
      return errorResponse(res, 'Role identifier (roleId) must be a string.', 400);
    }
    req.body.roleId = roleId.trim();
  }

  if (skills !== undefined && skills !== null) {
    let parsedSkills = skills;
    if (typeof parsedSkills === 'string') {
      parsedSkills = parsedSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (Array.isArray(parsedSkills)) {
      req.body.skills = parsedSkills.map((s) => String(s).trim()).filter(Boolean);
    }
  }

  return next();
};

/**
 * Validates the payload for AI job description analysis.
 */
const validateAnalyzeJobDescription = (req, res, next) => {
  const { jobDescription, description, content, roleId, roleTitle, title, category, skills } = req.body || {};
  const rawDescription =
    jobDescription !== undefined ? jobDescription : description !== undefined ? description : content;

  if (!rawDescription || typeof rawDescription !== 'string' || !rawDescription.trim()) {
    return errorResponse(res, 'Job description is required for analysis.', 400);
  }

  const trimmed = rawDescription.trim();
  if (trimmed.length < 5) {
    return errorResponse(res, 'Job description must be at least 5 characters long.', 400);
  }

  if (trimmed.length > 50000) {
    return errorResponse(res, 'Job description cannot exceed 50,000 characters.', 400);
  }

  if (roleId !== undefined && roleId !== null && typeof roleId !== 'string') {
    return errorResponse(res, 'Role identifier (roleId) must be a string.', 400);
  }

  const resolvedTitle = roleTitle !== undefined ? roleTitle : title;
  if (resolvedTitle !== undefined && resolvedTitle !== null && typeof resolvedTitle !== 'string') {
    return errorResponse(res, 'Role title must be a string.', 400);
  }

  if (category !== undefined && category !== null && typeof category !== 'string') {
    return errorResponse(res, 'Category must be a string.', 400);
  }

  if (skills !== undefined && skills !== null) {
    let parsedSkills = skills;
    if (typeof parsedSkills === 'string') {
      parsedSkills = parsedSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedSkills)) {
      return errorResponse(res, 'Skills must be an array of strings or a comma-separated string.', 400);
    }
    req.body.skills = parsedSkills.map((s) => String(s).trim()).filter(Boolean);
  }

  req.body.jobDescription = trimmed;
  return next();
};

/**
 * Validates the payload for AI question generation integrated with a job description.
 */
const validateGenerateQuestions = (req, res, next) => {
  const {
    jobDescription,
    description,
    content,
    jdAnalysis,
    roleId,
    roleTitle,
    title,
    questionCount,
    focusType,
    difficulty,
    skills,
  } = req.body || {};

  const rawDescription =
    jobDescription !== undefined ? jobDescription : description !== undefined ? description : content;

  const hasJdText = typeof rawDescription === 'string' && rawDescription.trim().length > 0;
  const resolvedTitle = roleTitle !== undefined ? roleTitle : title;
  const hasRoleContext =
    (typeof resolvedTitle === 'string' && resolvedTitle.trim().length > 0) ||
    (jdAnalysis && typeof jdAnalysis === 'object');

  if (rawDescription !== undefined && rawDescription !== null && typeof rawDescription !== 'string') {
    return errorResponse(res, 'Job description must be a string.', 400);
  }

  if (hasJdText) {
    const trimmed = rawDescription.trim();
    if (trimmed.length < 5) {
      return errorResponse(res, 'Job description must be at least 5 characters long.', 400);
    }
    if (trimmed.length > 50000) {
      return errorResponse(res, 'Job description cannot exceed 50,000 characters.', 400);
    }
    req.body.jobDescription = trimmed;
  } else if (!hasRoleContext) {
    return errorResponse(res, 'Job description or role context is required to generate questions.', 400);
  }

  if (roleId !== undefined && roleId !== null && typeof roleId !== 'string') {
    return errorResponse(res, 'Role identifier (roleId) must be a string.', 400);
  }

  if (questionCount !== undefined && questionCount !== null) {
    const parsedCount = Number(questionCount);
    if (!Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 10) {
      return errorResponse(res, 'Question count must be an integer between 1 and 10.', 400);
    }
  }

  if (focusType !== undefined && focusType !== null) {
    const allowedFocus = ['balanced', 'technical', 'behavioral', 'system_design'];
    if (typeof focusType !== 'string' || !allowedFocus.includes(focusType.trim().toLowerCase())) {
      return errorResponse(
        res,
        `Invalid focusType. Allowed values are: ${allowedFocus.join(', ')}.`,
        400
      );
    }
    req.body.focusType = focusType.trim().toLowerCase();
  }

  if (difficulty !== undefined && difficulty !== null) {
    const allowedDiff = ['mixed', 'easy', 'medium', 'hard'];
    if (typeof difficulty !== 'string' || !allowedDiff.includes(difficulty.trim().toLowerCase())) {
      return errorResponse(
        res,
        `Invalid difficulty. Allowed values are: ${allowedDiff.join(', ')}.`,
        400
      );
    }
    req.body.difficulty = difficulty.trim().toLowerCase();
  }

  if (skills !== undefined && skills !== null) {
    let parsedSkills = skills;
    if (typeof parsedSkills === 'string') {
      parsedSkills = parsedSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedSkills)) {
      return errorResponse(res, 'Skills must be an array of strings or a comma-separated string.', 400);
    }
    req.body.skills = parsedSkills.map((s) => String(s).trim()).filter(Boolean);
  }

  return next();
};

module.exports = {
  ALLOWED_CATEGORIES,
  validateCreateRole,
  validateUpdateRole,
  validateUserRoleAccess,
  validateCreateJobDescription,
  validateUpdateJobDescription,
  validateSaveJobDescription,
  validateAnalyzeJobDescription,
  validateGenerateQuestions,
};

