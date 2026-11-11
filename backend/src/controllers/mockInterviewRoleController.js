const {
  createJobRole,
  findAllJobRoles,
  findJobRoleById,
  updateJobRole,
  deleteJobRole,
  getJobRoleCategories,
} = require('../models/mockInterviewRoleModel');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Handles creation of a new Job Role for mock interviews.
 * POST /api/mock-interviews/roles
 */
const createJobRoleHandler = async (req, res) => {
  try {
    const { title } = req.body || {};

    if (!title || !title.trim()) {
      return errorResponse(res, 'Role title is required.', 400);
    }

    const userId = req.user ? req.user.id : null;
    const role = await createJobRole(req.body, userId);

    return successResponse(res, 'Job role created successfully.', { role }, 201);
  } catch (error) {
    console.error('Error creating job role:', error);
    return errorResponse(res, 'Failed to create job role: ' + error.message, 500);
  }
};

/**
 * Lists job roles with optional search and category filters.
 * GET /api/mock-interviews/roles
 */
const getJobRolesHandler = async (req, res) => {
  try {
    const { search, category, isCustom } = req.query;
    const userId = req.user ? req.user.id : null;

    const filters = {
      search,
      category,
      userId,
      isCustom: isCustom !== undefined ? isCustom === 'true' : undefined,
    };

    const roles = await findAllJobRoles(filters);

    return successResponse(res, 'Job roles retrieved successfully.', {
      roles,
      total: roles.length,
    });
  } catch (error) {
    console.error('Error fetching job roles:', error);
    return errorResponse(res, 'Failed to retrieve job roles: ' + error.message, 500);
  }
};

/**
 * Retrieves a single job role by ID or slug.
 * GET /api/mock-interviews/roles/:id
 */
const getJobRoleByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await findJobRoleById(id);

    if (!role) {
      return errorResponse(res, 'Job role not found.', 404);
    }

    return successResponse(res, 'Job role retrieved successfully.', { role });
  } catch (error) {
    console.error('Error fetching job role by ID:', error);
    return errorResponse(res, 'Failed to retrieve job role: ' + error.message, 500);
  }
};

/**
 * Retrieves all available job role categories.
 * GET /api/mock-interviews/roles/categories
 */
const getJobRoleCategoriesHandler = async (req, res) => {
  try {
    const categories = getJobRoleCategories();
    return successResponse(res, 'Job role categories retrieved successfully.', { categories });
  } catch (error) {
    console.error('Error fetching job role categories:', error);
    return errorResponse(res, 'Failed to retrieve job role categories: ' + error.message, 500);
  }
};

/**
 * Updates an existing job role.
 * PUT /api/mock-interviews/roles/:id
 */
const updateJobRoleHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const role = await updateJobRole(id, req.body, userId);
    return successResponse(res, 'Job role updated successfully.', { role });
  } catch (error) {
    console.error('Error updating job role:', error);
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, 404);
    }
    return errorResponse(res, 'Failed to update job role: ' + error.message, 500);
  }
};

/**
 * Deletes a job role.
 * DELETE /api/mock-interviews/roles/:id
 */
const deleteJobRoleHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    await deleteJobRole(id, userId);
    return successResponse(res, 'Job role deleted successfully.');
  } catch (error) {
    console.error('Error deleting job role:', error);
    return errorResponse(res, 'Failed to delete job role: ' + error.message, 500);
  }
};

module.exports = {
  createJobRoleHandler,
  getJobRolesHandler,
  getJobRoleByIdHandler,
  getJobRoleCategoriesHandler,
  updateJobRoleHandler,
  deleteJobRoleHandler,
};

