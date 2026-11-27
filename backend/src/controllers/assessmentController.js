const {
  createAssessment,
  findAssessmentByIdOrCode,
  findAllAssessments,
  updateAssessment,
  deleteAssessment,
  getAssessmentStats,
} = require('../models/assessmentModel');
const { findRecruiterByUserId } = require('../models/recruiterModel');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Helper to resolve the authenticated recruiter's ID from req.user
 */
const resolveRecruiterId = async (req) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) return { userId: null, recruiterId: null };

  let recruiterId = null;
  try {
    const recruiter = await findRecruiterByUserId(userId);
    if (recruiter) {
      recruiterId = recruiter.id;
    }
  } catch (err) {
    // Non-fatal: user might be an admin without a recruiter profile
    recruiterId = null;
  }

  return { userId, recruiterId };
};

/**
 * POST /api/assessments
 * Creates a new assessment.
 */
const createAssessmentHandler = async (req, res) => {
  try {
    const { title, name } = req.body;
    const assessmentTitle = title || name;

    if (!assessmentTitle || !assessmentTitle.trim()) {
      return errorResponse(res, 'Assessment title is required and cannot be empty.', 400);
    }

    const { userId, recruiterId } = await resolveRecruiterId(req);

    const payload = {
      ...req.body,
      title: assessmentTitle.trim(),
    };

    const assessment = await createAssessment(payload, userId, recruiterId);
    return successResponse(res, 'Assessment created successfully.', { assessment }, 201);
  } catch (error) {
    console.error('Error creating assessment:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to create assessment.', statusCode);
  }
};

/**
 * GET /api/assessments
 * Lists assessments with optional filtering, search, and pagination.
 */
const getAssessmentsHandler = async (req, res) => {
  try {
    const {
      search,
      query,
      q,
      status,
      difficulty,
      jobRole,
      role,
      vacancyId,
      sortBy = 'newest',
      page = 1,
      limit = 50,
      scope,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const { userId, recruiterId } = await resolveRecruiterId(req);

    // If scope === 'mine' or recruiter role, filter by recruiter if available
    let filterRecruiterId = null;
    let filterUserId = null;

    if (scope === 'mine' || (req.user && req.user.role === 'recruiter')) {
      if (recruiterId) filterRecruiterId = recruiterId;
      else if (userId) filterUserId = userId;
    }

    const filters = {
      search: search || query || q || '',
      status: status || null,
      difficulty: difficulty || null,
      jobRole: jobRole || role || null,
      vacancyId: vacancyId ? parseInt(vacancyId, 10) : null,
      recruiterId: filterRecruiterId,
      userId: filterUserId,
      sortBy,
      limit: limitNum,
      offset,
    };

    const result = await findAllAssessments(filters);
    const totalPages = Math.ceil(result.total / limitNum) || 1;

    return successResponse(res, 'Assessments retrieved successfully.', {
      assessments: result.assessments,
      pagination: {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return errorResponse(res, error.message || 'Failed to retrieve assessments.', 500);
  }
};

/**
 * GET /api/assessments/:id
 * Retrieves a single assessment by its numeric ID or code (e.g., A-1001).
 */
const getAssessmentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 'Assessment ID or code is required.', 400);
    }

    const assessment = await findAssessmentByIdOrCode(id);
    if (!assessment) {
      return errorResponse(res, 'Assessment not found.', 404);
    }

    return successResponse(res, 'Assessment retrieved successfully.', { assessment });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return errorResponse(res, error.message || 'Failed to retrieve assessment.', 500);
  }
};

/**
 * PUT /api/assessments/:id
 * Updates an existing assessment.
 */
const updateAssessmentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 'Assessment ID or code is required.', 400);
    }

    const { userId, recruiterId } = await resolveRecruiterId(req);

    // If an admin is performing the update, bypass ownership restriction
    const authUserId = req.user?.role === 'admin' ? null : userId;
    const authRecruiterId = req.user?.role === 'admin' ? null : recruiterId;

    const updated = await updateAssessment(id, req.body, authUserId, authRecruiterId);
    return successResponse(res, 'Assessment updated successfully.', { assessment: updated });
  } catch (error) {
    console.error('Error updating assessment:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to update assessment.', statusCode);
  }
};

/**
 * DELETE /api/assessments/:id
 * Deletes an assessment by ID or code.
 */
const deleteAssessmentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 'Assessment ID or code is required.', 400);
    }

    const { userId, recruiterId } = await resolveRecruiterId(req);

    // If an admin is performing the delete, bypass ownership restriction
    const authUserId = req.user?.role === 'admin' ? null : userId;
    const authRecruiterId = req.user?.role === 'admin' ? null : recruiterId;

    await deleteAssessment(id, authUserId, authRecruiterId);
    return successResponse(res, 'Assessment deleted successfully.');
  } catch (error) {
    console.error('Error deleting assessment:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to delete assessment.', statusCode);
  }
};

/**
 * GET /api/assessments/stats
 * Retrieves aggregate metrics for assessments (total, active, draft, archived).
 */
const getAssessmentStatsHandler = async (req, res) => {
  try {
    const { recruiterId } = await resolveRecruiterId(req);
    const stats = await getAssessmentStats(recruiterId);
    return successResponse(res, 'Assessment statistics retrieved successfully.', { stats });
  } catch (error) {
    console.error('Error fetching assessment stats:', error);
    return errorResponse(res, error.message || 'Failed to retrieve assessment statistics.', 500);
  }
};

module.exports = {
  createAssessmentHandler,
  getAssessmentsHandler,
  getAssessmentHandler,
  updateAssessmentHandler,
  deleteAssessmentHandler,
  getAssessmentStatsHandler,
};

