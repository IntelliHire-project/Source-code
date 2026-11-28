const {
  createJobDescription,
  findAllJobDescriptions,
  findJobDescriptionById,
  findLatestJobDescription,
  updateJobDescription,
  deleteJobDescription,
  saveSelectedJobDescription,
  getRoleIntegratedJobDescription,
  attachJobDescriptionToSelectedRole,
  updateSelectedRoleJobDescription,
  updateJobDescriptionAnalysis,
} = require('../models/mockInterviewJobDescriptionModel');
const { analyzeJobDescription } = require('../services/mockInterviewJdAnalysisService');
const { generateQuestionsFromJobDescription } = require('../services/mockInterviewQuestionGeneratorService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Handles creation of a new Job Description for mock interview preparation.
 * POST /api/mock-interviews/job-descriptions or POST /api/mock-interviews/job-description
 */
const createJobDescriptionHandler = async (req, res) => {
  try {
    const { jobDescription, description, content } = req.body || {};
    const text = jobDescription || description || content;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return errorResponse(res, 'Job description is required and must be a non-empty string.', 400);
    }

    const created = await createJobDescription(req.body, req.user);
    return successResponse(res, 'Job description created successfully.', { jobDescription: created }, 201);
  } catch (error) {
    console.error('Error creating job description:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to create job description.', statusCode);
  }
};

/**
 * Handles fetching all job descriptions with optional filters.
 * GET /api/mock-interviews/job-descriptions or GET /api/mock-interviews/job-description
 */
const getJobDescriptionsHandler = async (req, res) => {
  try {
    const { roleId, search, q, page, limit } = req.query;
    const userId = req.user ? req.user.id : req.query.userId || null;

    const filters = {
      userId,
      roleId,
      search: search || q,
      page,
      limit,
    };

    const jobDescriptions = await findAllJobDescriptions(filters);
    return successResponse(res, 'Job descriptions retrieved successfully.', {
      jobDescriptions,
      total: jobDescriptions.length,
    });
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to retrieve job descriptions.', statusCode);
  }
};

/**
 * Handles retrieving a single job description by ID.
 * GET /api/mock-interviews/job-descriptions/:id or GET /api/mock-interviews/job-description/:id
 */
const getJobDescriptionByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 'Job description identifier is required.', 400);
    }

    const jobDescription = await findJobDescriptionById(id);
    if (!jobDescription) {
      return errorResponse(res, 'Job description not found.', 404);
    }

    return successResponse(res, 'Job description retrieved successfully.', { jobDescription });
  } catch (error) {
    console.error('Error fetching job description by ID:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to retrieve job description.', statusCode);
  }
};

/**
 * Handles retrieving the latest job description for the current user.
 * GET /api/mock-interviews/job-descriptions/latest or GET /api/mock-interviews/job-description/latest
 */
const getLatestJobDescriptionHandler = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const jobDescription = await findLatestJobDescription(userId);

    if (!jobDescription) {
      return successResponse(res, 'No job description found.', { jobDescription: null });
    }

    return successResponse(res, 'Latest job description retrieved successfully.', { jobDescription });
  } catch (error) {
    console.error('Error fetching latest job description:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to retrieve latest job description.', statusCode);
  }
};

/**
 * Handles updating an existing job description.
 * PUT /api/mock-interviews/job-descriptions/:id or PUT /api/mock-interviews/job-description/:id
 */
const updateJobDescriptionHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 'Job description identifier is required.', 400);
    }

    const updated = await updateJobDescription(id, req.body, req.user);
    return successResponse(res, 'Job description updated successfully.', { jobDescription: updated });
  } catch (error) {
    console.error('Error updating job description:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to update job description.', statusCode);
  }
};

/**
 * Handles deleting an existing job description.
 * DELETE /api/mock-interviews/job-descriptions/:id or DELETE /api/mock-interviews/job-description/:id
 */
const deleteJobDescriptionHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 'Job description identifier is required.', 400);
    }

    await deleteJobDescription(id, req.user);
    return successResponse(res, 'Job description deleted successfully.');
  } catch (error) {
    console.error('Error deleting job description:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to delete job description.', statusCode);
  }
};

/**
 * Handles storing/saving a job description for the candidate's mock interview session.
 * POST /api/mock-interviews/job-descriptions/save or POST /api/mock-interviews/job-description/save
 */
const saveMockInterviewJobDescriptionHandler = async (req, res) => {
  try {
    const { jobDescription, description, content } = req.body || {};
    const text = jobDescription || description || content;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return errorResponse(res, 'Job description is required and must be a non-empty string.', 400);
    }

    const saved = await saveSelectedJobDescription(req.body, req.user);
    return successResponse(res, 'Mock interview job description saved successfully.', { jobDescription: saved }, 201);
  } catch (error) {
    console.error('Error saving mock interview job description:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to save mock interview job description.', statusCode);
  }
};

/**
 * Retrieves the integrated job description for a specific role or the selected role.
 * GET /api/mock-interviews/roles/:roleId/job-description or GET /api/mock-interviews/job-descriptions/role/:roleId
 */
const getRoleIntegratedJobDescriptionHandler = async (req, res) => {
  try {
    const { roleId } = req.params;
    if (!roleId) {
      return errorResponse(res, 'Role identifier (roleId) is required.', 400);
    }

    const userId = req.user ? req.user.id : null;
    const integrated = await getRoleIntegratedJobDescription(roleId, userId);

    if (!integrated) {
      return errorResponse(res, 'Job role not found.', 404);
    }

    return successResponse(res, 'Role-integrated job description retrieved successfully.', {
      integration: integrated,
      role: integrated.role,
      template: integrated.template,
      activeJobDescription: integrated.activeJobDescription,
      savedJobDescription: integrated.savedJobDescription,
    });
  } catch (error) {
    console.error('Error fetching role-integrated job description:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to retrieve role-integrated job description.', statusCode);
  }
};

/**
 * Handles attaching and integrating a job description directly with the candidate's selected role.
 * POST /api/mock-interviews/roles/selected/job-description or PUT /api/mock-interviews/roles/selected/job-description
 */
const attachJobDescriptionToSelectedRoleHandler = async (req, res) => {
  try {
    const { roleId } = req.body || {};
    if (!roleId || !String(roleId).trim()) {
      return errorResponse(res, 'Role identifier (roleId) is required to integrate job description.', 400);
    }

    const integrated = await attachJobDescriptionToSelectedRole(req.body, req.user);
    return successResponse(
      res,
      'Job description successfully integrated with selected role.',
      { integratedRole: integrated },
      200
    );
  } catch (error) {
    console.error('Error attaching job description to selected role:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to integrate job description with selected role.', statusCode);
  }
};

/**
 * Handles updating the job description attached to the currently selected role.
 * PUT /api/mock-interviews/roles/selected/job-description or PATCH /api/mock-interviews/roles/selected/job-description
 */
const updateSelectedRoleJobDescriptionHandler = async (req, res) => {
  try {
    const { roleId } = req.body || {};
    if (!roleId || !String(roleId).trim()) {
      return errorResponse(res, 'Role identifier (roleId) is required to update job description.', 400);
    }

    const updated = await updateSelectedRoleJobDescription(req.body, req.user);
    return successResponse(
      res,
      'Job description updated successfully for selected role.',
      { updatedRole: updated, jobDescription: updated.jobDescription },
      200
    );
  } catch (error) {
    console.error('Error updating selected role job description:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to update job description for selected role.', statusCode);
  }
};

/**
 * Analyzes a mock interview job description using AI and returns structured insights
 * plus tailored interview questions.
 * POST /api/mock-interviews/job-descriptions/analyze or POST /api/mock-interviews/job-description/analyze
 */
const analyzeJobDescriptionHandler = async (req, res) => {
  try {
    const { jobDescription, description, content, jdId, id } = req.body || {};
    const text = jobDescription || description || content;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return errorResponse(res, 'Job description is required for analysis.', 400);
    }

    const analysis = await analyzeJobDescription(req.body);
    const targetJdId = jdId || id;
    if (targetJdId && typeof updateJobDescriptionAnalysis === 'function') {
      await updateJobDescriptionAnalysis(targetJdId, analysis, req.user).catch(() => {});
    }

    return successResponse(res, 'Job description analyzed successfully.', { analysis }, 200);
  } catch (error) {
    console.error('Error analyzing job description:', error);
    const statusCode = error.statusCode || error.status || 500;
    return errorResponse(res, error.message || 'Failed to analyze job description.', statusCode);
  }
};

/**
 * Generates tailored mock interview questions integrated with a job description
 * and its AI analysis (skills, responsibilities, and experience requirements).
 * POST /api/mock-interviews/questions/generate or POST /api/mock-interviews/job-descriptions/generate-questions
 */
const generateQuestionsFromJobDescriptionHandler = async (req, res) => {
  try {
    const result = await generateQuestionsFromJobDescription(req.body || {});
    const targetJdId = req.body?.jdId || req.body?.id;
    if (targetJdId && result.analysis && typeof updateJobDescriptionAnalysis === 'function') {
      await updateJobDescriptionAnalysis(targetJdId, result.analysis, req.user).catch(() => {});
    }

    return successResponse(
      res,
      'Mock interview questions generated successfully.',
      {
        questions: result.questions,
        analysis: result.analysis,
        roleProfile: result.roleProfile,
        generationSource: result.generationSource,
        parameters: result.parameters,
        generatedAt: result.generatedAt,
      },
      200
    );
  } catch (error) {
    console.error('Error generating mock interview questions:', error);
    const statusCode = error.statusCode || error.status || 500;
    return errorResponse(res, error.message || 'Failed to generate mock interview questions.', statusCode);
  }
};

module.exports = {
  createJobDescriptionHandler,
  getJobDescriptionsHandler,
  getJobDescriptionByIdHandler,
  getLatestJobDescriptionHandler,
  updateJobDescriptionHandler,
  deleteJobDescriptionHandler,
  saveMockInterviewJobDescriptionHandler,
  getRoleIntegratedJobDescriptionHandler,
  attachJobDescriptionToSelectedRoleHandler,
  updateSelectedRoleJobDescriptionHandler,
  analyzeJobDescriptionHandler,
  generateQuestionsFromJobDescriptionHandler,
};

