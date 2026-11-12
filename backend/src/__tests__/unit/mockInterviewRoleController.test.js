jest.mock('../../models/mockInterviewRoleModel', () => ({
  createJobRole: jest.fn(),
  findAllJobRoles: jest.fn(),
  findJobRoleById: jest.fn(),
  updateJobRole: jest.fn(),
  deleteJobRole: jest.fn(),
  getJobRoleCategories: jest.fn(),
}));

jest.mock('../../utils/response', () => ({
  successResponse: jest.fn(),
  errorResponse: jest.fn(),
}));

const {
  createJobRole,
  findAllJobRoles,
  findJobRoleById,
  updateJobRole,
  deleteJobRole,
  getJobRoleCategories,
} = require('../../models/mockInterviewRoleModel');
const { successResponse, errorResponse } = require('../../utils/response');
const {
  createJobRoleHandler,
  getJobRolesHandler,
  getJobRoleByIdHandler,
  getJobRoleCategoriesHandler,
  updateJobRoleHandler,
  deleteJobRoleHandler,
} = require('../../controllers/mockInterviewRoleController');

describe('mockInterviewRoleController Unit Tests', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('createJobRoleHandler', () => {
    test('rejects request if title is missing or empty', async () => {
      req.body = { title: '   ' };

      await createJobRoleHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Role title is required and must be a non-empty string.',
        400
      );
      expect(createJobRole).not.toHaveBeenCalled();
    });

    test('creates job role successfully and returns 201', async () => {
      const mockRole = {
        id: 'custom-ml-engineer',
        title: 'Machine Learning Engineer',
        category: 'engineering',
        isCustom: true,
      };
      req.body = { title: 'Machine Learning Engineer', category: 'engineering' };
      req.user = { id: 10, role: 'candidate' };
      createJobRole.mockResolvedValue(mockRole);

      await createJobRoleHandler(req, res);

      expect(createJobRole).toHaveBeenCalledWith(req.body, req.user);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Job role created successfully.',
        { role: mockRole },
        201
      );
    });

    test('handles duplicate role conflict with 409 status code', async () => {
      req.body = { title: 'Backend Developer' };
      const conflictError = new Error('A job role with the title "Backend Developer" already exists.');
      conflictError.statusCode = 409;
      createJobRole.mockRejectedValue(conflictError);

      await createJobRoleHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        conflictError.message,
        409
      );
    });

    test('handles unexpected internal server errors with 500', async () => {
      req.body = { title: 'DevOps Engineer' };
      createJobRole.mockRejectedValue(new Error('Database connection failed.'));

      await createJobRoleHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Database connection failed.',
        500
      );
    });
  });

  describe('getJobRolesHandler', () => {
    test('fetches all job roles and passes filters and user scope', async () => {
      const mockRoles = [
        { id: 'backend', title: 'Backend Developer' },
        { id: 'frontend', title: 'Frontend Developer' },
      ];
      req.query = { search: 'Developer', category: 'engineering', sortBy: 'titleAsc' };
      req.user = { id: 5 };
      findAllJobRoles.mockResolvedValue(mockRoles);

      await getJobRolesHandler(req, res);

      expect(findAllJobRoles).toHaveBeenCalledWith({
        search: 'Developer',
        category: 'engineering',
        userId: 5,
        isCustom: undefined,
        sortBy: 'titleAsc',
        page: undefined,
        limit: undefined,
        includeShared: true,
      });
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Job roles retrieved successfully.',
        { roles: mockRoles, total: 2 }
      );
    });

    test('handles retrieval failure with 500', async () => {
      findAllJobRoles.mockRejectedValue(new Error('Unexpected query failure.'));

      await getJobRolesHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Unexpected query failure.',
        500
      );
    });
  });

  describe('getJobRoleByIdHandler', () => {
    test('retrieves single job role by ID or slug', async () => {
      const mockRole = { id: 'backend', title: 'Backend Developer' };
      req.params = { id: 'backend' };
      findJobRoleById.mockResolvedValue(mockRole);

      await getJobRoleByIdHandler(req, res);

      expect(findJobRoleById).toHaveBeenCalledWith('backend');
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Job role retrieved successfully.',
        { role: mockRole }
      );
    });

    test('rejects missing or empty identifier with 400', async () => {
      req.params = { id: '   ' };

      await getJobRoleByIdHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job role identifier is required.',
        400
      );
      expect(findJobRoleById).not.toHaveBeenCalled();
    });

    test('returns 404 when job role is not found', async () => {
      req.params = { id: 'nonexistent-role' };
      findJobRoleById.mockResolvedValue(null);

      await getJobRoleByIdHandler(req, res);

      expect(findJobRoleById).toHaveBeenCalledWith('nonexistent-role');
      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job role not found.',
        404
      );
    });

    test('handles internal errors with 500', async () => {
      req.params = { id: 'qa' };
      findJobRoleById.mockRejectedValue(new Error('Database error.'));

      await getJobRoleByIdHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Database error.', 500);
    });
  });

  describe('getJobRoleCategoriesHandler', () => {
    test('retrieves categories successfully', async () => {
      const mockCategories = [
        { id: 'all', label: 'All Categories', count: 5 },
        { id: 'engineering', label: 'Engineering', count: 2 },
      ];
      getJobRoleCategories.mockResolvedValue(mockCategories);

      await getJobRoleCategoriesHandler(req, res);

      expect(getJobRoleCategories).toHaveBeenCalled();
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Job role categories retrieved successfully.',
        { categories: mockCategories }
      );
    });

    test('handles error retrieving categories with 500', async () => {
      getJobRoleCategories.mockRejectedValue(new Error('Failed categories'));

      await getJobRoleCategoriesHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Failed categories', 500);
    });
  });

  describe('updateJobRoleHandler', () => {
    test('updates job role successfully', async () => {
      const updatedRole = { id: 'custom-123', title: 'Senior ML Engineer' };
      req.params = { id: 'custom-123' };
      req.body = { title: 'Senior ML Engineer' };
      req.user = { id: 7, role: 'candidate' };
      updateJobRole.mockResolvedValue(updatedRole);

      await updateJobRoleHandler(req, res);

      expect(updateJobRole).toHaveBeenCalledWith('custom-123', req.body, req.user);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Job role updated successfully.',
        { role: updatedRole }
      );
    });

    test('rejects empty ID with 400', async () => {
      req.params = { id: '' };

      await updateJobRoleHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job role identifier is required.',
        400
      );
      expect(updateJobRole).not.toHaveBeenCalled();
    });

    test('returns 403 when updating system default role without admin privilege', async () => {
      req.params = { id: 'backend' };
      req.body = { title: 'Modified Backend' };
      const forbiddenError = new Error('System default job roles can only be modified by an administrator.');
      forbiddenError.statusCode = 403;
      updateJobRole.mockRejectedValue(forbiddenError);

      await updateJobRoleHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        forbiddenError.message,
        403
      );
    });

    test('returns 404 when role to update is not found', async () => {
      req.params = { id: 'missing-role' };
      const notFoundError = new Error('Job role not found.');
      notFoundError.statusCode = 404;
      updateJobRole.mockRejectedValue(notFoundError);

      await updateJobRoleHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job role not found.',
        404
      );
    });

    test('returns 409 when renaming causes a duplicate title', async () => {
      req.params = { id: 'custom-456' };
      req.body = { title: 'Frontend Developer' };
      const duplicateError = new Error('A job role with the title "Frontend Developer" already exists.');
      duplicateError.statusCode = 409;
      updateJobRole.mockRejectedValue(duplicateError);

      await updateJobRoleHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        duplicateError.message,
        409
      );
    });
  });

  describe('deleteJobRoleHandler', () => {
    test('deletes custom role successfully', async () => {
      req.params = { id: 'custom-role-789' };
      req.user = { id: 12, role: 'candidate' };
      deleteJobRole.mockResolvedValue(true);

      await deleteJobRoleHandler(req, res);

      expect(deleteJobRole).toHaveBeenCalledWith('custom-role-789', req.user);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Job role deleted successfully.'
      );
    });

    test('rejects empty ID with 400', async () => {
      req.params = { id: ' ' };

      await deleteJobRoleHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job role identifier is required.',
        400
      );
      expect(deleteJobRole).not.toHaveBeenCalled();
    });

    test('blocks deletion of system default roles with 403', async () => {
      req.params = { id: 'frontend' };
      const protectionError = new Error('System default job roles cannot be deleted.');
      protectionError.statusCode = 403;
      deleteJobRole.mockRejectedValue(protectionError);

      await deleteJobRoleHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        protectionError.message,
        403
      );
    });

    test('blocks deletion by non-owner user with 403', async () => {
      req.params = { id: 'custom-other-user' };
      const unauthorizedError = new Error('Access denied. You do not have permission to delete this job role.');
      unauthorizedError.statusCode = 403;
      deleteJobRole.mockRejectedValue(unauthorizedError);

      await deleteJobRoleHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        unauthorizedError.message,
        403
      );
    });

    test('returns 404 when role to delete does not exist', async () => {
      req.params = { id: 'not-existing' };
      const notFoundError = new Error('Job role not found.');
      notFoundError.statusCode = 404;
      deleteJobRole.mockRejectedValue(notFoundError);

      await deleteJobRoleHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job role not found.',
        404
      );
    });
  });
});

