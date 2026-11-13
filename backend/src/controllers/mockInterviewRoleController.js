const {
  createJobRole,
  findAllJobRoles,
  findAvailableJobRoles,
  findJobRoleById,
  updateJobRole,
  deleteJobRole,
  getJobRoleCategories,
} = require('../models/mockInterviewRoleModel');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Handles creation of a new Job Role for mock interviews with validation.
 * POST /api/mock-interviews/roles
 */
const createJobRoleHandler = async (req, res) => {
  try {
    const { title } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return errorResponse(res, 'Role title is required and must be a non-empty string.', 400);
    }

    const role = await createJobRole(req.body, req.user);
    return successResponse(res, 'Job role created successfully.', { role }, 201);
  } catch (error) {
    console.error('Error creating job role:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to create job role.', statusCode);
  }
};

/**
 * Handles fetching available job roles for candidate mock interviews.
 * GET /api/mock-interviews/roles/available, GET /api/mock-interviews/available, or GET /api/mock-interviews/available-roles
 */
const getAvailableRolesHandler = async (req, res) => {
  try {
    const {
      search,
      q,
      category,
      sortBy = 'default',
      page,
      limit,
    } = req.query;

    const userId = req.user ? req.user.id : null;

    const filters = {
      search: search || q,
      category,
      userId,
      sortBy,
      page,
      limit,
      includeShared: true,
    };

    const [roles, categories] = await Promise.all([
      findAvailableJobRoles(filters),
      getJobRoleCategories().catch(() => []),
    ]);

    return successResponse(res, 'Available job roles retrieved successfully.', {
      roles,
      total: roles.length,
      availableCount: roles.length,
      categories,
    });
  } catch (error) {
    console.error('Error fetching available job roles:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to retrieve available job roles.', statusCode);
  }
};

/**
 * Lists job roles with optional search, category filters, sorting, and user scope.
 * GET /api/mock-interviews/roles
 */
const getJobRolesHandler = async (req, res) => {
  try {
    const {
      search,
      q,
      category,
      isCustom,
      sortBy,
      page,
      limit,
      includeShared,
    } = req.query;

    const userId = req.user ? req.user.id : null;

    const filters = {
      search: search || q,
      category,
      userId,
      isCustom: isCustom !== undefined ? isCustom === 'true' : undefined,
      sortBy,
      page,
      limit,
      includeShared: includeShared !== undefined ? includeShared === 'true' : true,
    };

    const roles = await findAllJobRoles(filters);

    return successResponse(res, 'Job roles retrieved successfully.', {
      roles,
      total: roles.length,
    });
  } catch (error) {
    console.error('Error fetching job roles:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to retrieve job roles.', statusCode);
  }
};

/**
 * Retrieves a single job role by ID or slug.
 * GET /api/mock-interviews/roles/:id
 */
const getJobRoleByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !String(id).trim()) {
      return errorResponse(res, 'Job role identifier is required.', 400);
    }

    const role = await findJobRoleById(id);
    if (!role) {
      return errorResponse(res, 'Job role not found.', 404);
    }

    return successResponse(res, 'Job role retrieved successfully.', { role });
  } catch (error) {
    console.error('Error fetching job role by ID:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to retrieve job role.', statusCode);
  }
};

/**
 * Retrieves all available job role categories enriched with counts.
 * GET /api/mock-interviews/roles/categories
 */
const getJobRoleCategoriesHandler = async (req, res) => {
  try {
    const categories = await getJobRoleCategories();
    return successResponse(res, 'Job role categories retrieved successfully.', { categories });
  } catch (error) {
    console.error('Error fetching job role categories:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to retrieve job role categories.', statusCode);
  }
};

/**
 * Updates an existing job role with validation and authorization checks.
 * PUT /api/mock-interviews/roles/:id
 */
const updateJobRoleHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !String(id).trim()) {
      return errorResponse(res, 'Job role identifier is required.', 400);
    }

    const role = await updateJobRole(id, req.body, req.user);
    return successResponse(res, 'Job role updated successfully.', { role });
  } catch (error) {
    console.error('Error updating job role:', error);
    const statusCode = error.statusCode || (error.message && error.message.includes('not found') ? 404 : 500);
    return errorResponse(res, error.message || 'Failed to update job role.', statusCode);
  }
};

/**
 * Deletes a job role with system protection and ownership checks.
 * DELETE /api/mock-interviews/roles/:id
 */
const deleteJobRoleHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !String(id).trim()) {
      return errorResponse(res, 'Job role identifier is required.', 400);
    }

    await deleteJobRole(id, req.user);
    return successResponse(res, 'Job role deleted successfully.');
  } catch (error) {
    console.error('Error deleting job role:', error);
    const statusCode = error.statusCode || (error.message && error.message.includes('not found') ? 404 : 500);
    return errorResponse(res, error.message || 'Failed to delete job role.', statusCode);
  }
};

module.exports = {
  createJobRoleHandler,
  getJobRolesHandler,
  getAvailableRolesHandler,
  getJobRoleByIdHandler,
  getJobRoleCategoriesHandler,
  updateJobRoleHandler,
  deleteJobRoleHandler,
};
