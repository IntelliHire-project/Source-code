jest.mock('../../models/mockInterviewJobDescriptionModel', () => ({
  createJobDescription: jest.fn(),
  findAllJobDescriptions: jest.fn(),
  findJobDescriptionById: jest.fn(),
  findLatestJobDescription: jest.fn(),
  updateJobDescription: jest.fn(),
  deleteJobDescription: jest.fn(),
  saveSelectedJobDescription: jest.fn(),
}));

jest.mock('../../utils/response', () => ({
  successResponse: jest.fn(),
  errorResponse: jest.fn(),
}));

const {
  createJobDescription,
  findAllJobDescriptions,
  findJobDescriptionById,
  findLatestJobDescription,
  updateJobDescription,
  deleteJobDescription,
  saveSelectedJobDescription,
} = require('../../models/mockInterviewJobDescriptionModel');
const { successResponse, errorResponse } = require('../../utils/response');
const {
  createJobDescriptionHandler,
  getJobDescriptionsHandler,
  getJobDescriptionByIdHandler,
  getLatestJobDescriptionHandler,
  updateJobDescriptionHandler,
  deleteJobDescriptionHandler,
  saveMockInterviewJobDescriptionHandler,
} = require('../../controllers/mockInterviewJobDescriptionController');

describe('mockInterviewJobDescriptionController Unit Tests', () => {
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

  // =========================================================================
  // 1. createJobDescriptionHandler
  // =========================================================================
  describe('createJobDescriptionHandler', () => {
    test('rejects request if jobDescription is missing or empty', async () => {
      req.body = { jobDescription: '   ' };

      await createJobDescriptionHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job description is required and must be a non-empty string.',
        400
      );
      expect(createJobDescription).not.toHaveBeenCalled();
    });

    test('rejects request if jobDescription is non-string', async () => {
      req.body = { jobDescription: 12345 };

      await createJobDescriptionHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job description is required and must be a non-empty string.',
        400
      );
      expect(createJobDescription).not.toHaveBeenCalled();
    });

    test('creates job description successfully and returns 201', async () => {
      const mockCreated = {
        id: 1,
        title: 'Backend Engineer',
        jobDescription: 'Design microservices and maintain APIs.',
        skills: ['Node.js', 'PostgreSQL'],
      };
      req.body = {
        title: 'Backend Engineer',
        jobDescription: 'Design microservices and maintain APIs.',
      };
      req.user = { id: 10, role: 'candidate' };
      createJobDescription.mockResolvedValue(mockCreated);

      await createJobDescriptionHandler(req, res);

      expect(createJobDescription).toHaveBeenCalledWith(req.body, req.user);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Job description created successfully.',
        { jobDescription: mockCreated },
        201
      );
    });

    test('accepts alternate keys (description or content)', async () => {
      const mockCreated = {
        id: 2,
        jobDescription: 'Build modern user interfaces.',
      };
      req.body = { description: 'Build modern user interfaces.' };
      createJobDescription.mockResolvedValue(mockCreated);

      await createJobDescriptionHandler(req, res);

      expect(createJobDescription).toHaveBeenCalledWith(req.body, null);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Job description created successfully.',
        { jobDescription: mockCreated },
        201
      );
    });

    test('handles model rejection with error status code', async () => {
      req.body = { jobDescription: 'Valid job description' };
      const customError = new Error('Database connection failed.');
      customError.statusCode = 503;
      createJobDescription.mockRejectedValue(customError);

      await createJobDescriptionHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Database connection failed.', 503);
    });
  });

  // =========================================================================
  // 2. getJobDescriptionsHandler
  // =========================================================================
  describe('getJobDescriptionsHandler', () => {
    test('retrieves job descriptions with query filters and returns 200', async () => {
      const mockList = [
        { id: 1, title: 'Role 1', jobDescription: 'Desc 1' },
        { id: 2, title: 'Role 2', jobDescription: 'Desc 2' },
      ];
      req.query = { search: 'Role', roleId: 'backend', page: '1', limit: '10' };
      req.user = { id: 5 };
      findAllJobDescriptions.mockResolvedValue(mockList);

      await getJobDescriptionsHandler(req, res);

      expect(findAllJobDescriptions).toHaveBeenCalledWith({
        userId: 5,
        roleId: 'backend',
        search: 'Role',
        page: '1',
        limit: '10',
      });
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Job descriptions retrieved successfully.',
        {
          jobDescriptions: mockList,
          total: 2,
        }
      );
    });

    test('handles error during fetch and returns 500', async () => {
      findAllJobDescriptions.mockRejectedValue(new Error('Fetch failed.'));

      await getJobDescriptionsHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Fetch failed.', 500);
    });
  });

  // =========================================================================
  // 3. getJobDescriptionByIdHandler
  // =========================================================================
  describe('getJobDescriptionByIdHandler', () => {
    test('rejects request if id parameter is missing', async () => {
      req.params = {};

      await getJobDescriptionByIdHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job description identifier is required.',
        400
      );
      expect(findJobDescriptionById).not.toHaveBeenCalled();
    });

    test('returns 404 if job description is not found', async () => {
      req.params = { id: '999' };
      findJobDescriptionById.mockResolvedValue(null);

      await getJobDescriptionByIdHandler(req, res);

      expect(findJobDescriptionById).toHaveBeenCalledWith('999');
      expect(errorResponse).toHaveBeenCalledWith(res, 'Job description not found.', 404);
    });

    test('returns 200 with job description data when found', async () => {
      const mockJd = { id: 12, title: 'Data Scientist', jobDescription: 'Analyze big data.' };
      req.params = { id: '12' };
      findJobDescriptionById.mockResolvedValue(mockJd);

      await getJobDescriptionByIdHandler(req, res);

      expect(findJobDescriptionById).toHaveBeenCalledWith('12');
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Job description retrieved successfully.',
        { jobDescription: mockJd }
      );
    });

    test('handles retrieval error and returns 500', async () => {
      req.params = { id: '1' };
      findJobDescriptionById.mockRejectedValue(new Error('Query error'));

      await getJobDescriptionByIdHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Query error', 500);
    });
  });

  // =========================================================================
  // 4. getLatestJobDescriptionHandler
  // =========================================================================
  describe('getLatestJobDescriptionHandler', () => {
    test('returns null when no latest job description is found', async () => {
      req.user = { id: 7 };
      findLatestJobDescription.mockResolvedValue(null);

      await getLatestJobDescriptionHandler(req, res);

      expect(findLatestJobDescription).toHaveBeenCalledWith(7);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'No job description found.',
        { jobDescription: null }
      );
    });

    test('returns latest job description when present', async () => {
      const mockJd = { id: 55, title: 'DevOps Engineer', jobDescription: 'CI/CD Pipelines' };
      req.user = { id: 7 };
      findLatestJobDescription.mockResolvedValue(mockJd);

      await getLatestJobDescriptionHandler(req, res);

      expect(findLatestJobDescription).toHaveBeenCalledWith(7);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Latest job description retrieved successfully.',
        { jobDescription: mockJd }
      );
    });

    test('handles error and returns 500', async () => {
      findLatestJobDescription.mockRejectedValue(new Error('DB error'));

      await getLatestJobDescriptionHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'DB error', 500);
    });
  });

  // =========================================================================
  // 5. updateJobDescriptionHandler
  // =========================================================================
  describe('updateJobDescriptionHandler', () => {
    test('rejects request if id parameter is missing', async () => {
      req.params = {};

      await updateJobDescriptionHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job description identifier is required.',
        400
      );
      expect(updateJobDescription).not.toHaveBeenCalled();
    });

    test('updates job description successfully and returns 200', async () => {
      const mockUpdated = {
        id: 10,
        title: 'Lead Architect',
        jobDescription: 'Updated system architecture role.',
      };
      req.params = { id: '10' };
      req.body = { title: 'Lead Architect' };
      req.user = { id: 3, role: 'candidate' };
      updateJobDescription.mockResolvedValue(mockUpdated);

      await updateJobDescriptionHandler(req, res);

      expect(updateJobDescription).toHaveBeenCalledWith('10', req.body, req.user);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Job description updated successfully.',
        { jobDescription: mockUpdated }
      );
    });

    test('handles 404 when job description does not exist', async () => {
      req.params = { id: '404' };
      const notFoundError = new Error('Job description not found.');
      notFoundError.statusCode = 404;
      updateJobDescription.mockRejectedValue(notFoundError);

      await updateJobDescriptionHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Job description not found.', 404);
    });

    test('handles 403 access denied when user does not own job description', async () => {
      req.params = { id: '10' };
      const forbiddenError = new Error('Access denied. You do not have permission to update this job description.');
      forbiddenError.statusCode = 403;
      updateJobDescription.mockRejectedValue(forbiddenError);

      await updateJobDescriptionHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Access denied. You do not have permission to update this job description.',
        403
      );
    });
  });

  // =========================================================================
  // 6. deleteJobDescriptionHandler
  // =========================================================================
  describe('deleteJobDescriptionHandler', () => {
    test('rejects request if id parameter is missing', async () => {
      req.params = {};

      await deleteJobDescriptionHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job description identifier is required.',
        400
      );
      expect(deleteJobDescription).not.toHaveBeenCalled();
    });

    test('deletes job description successfully and returns 200', async () => {
      req.params = { id: '15' };
      req.user = { id: 3, role: 'candidate' };
      deleteJobDescription.mockResolvedValue(true);

      await deleteJobDescriptionHandler(req, res);

      expect(deleteJobDescription).toHaveBeenCalledWith('15', req.user);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Job description deleted successfully.'
      );
    });

    test('handles 404 when job description to delete is not found', async () => {
      req.params = { id: '999' };
      const notFoundError = new Error('Job description not found.');
      notFoundError.statusCode = 404;
      deleteJobDescription.mockRejectedValue(notFoundError);

      await deleteJobDescriptionHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Job description not found.', 404);
    });

    test('handles 403 when user lacks delete permission', async () => {
      req.params = { id: '15' };
      const forbiddenError = new Error('Access denied. You do not have permission to delete this job description.');
      forbiddenError.statusCode = 403;
      deleteJobDescription.mockRejectedValue(forbiddenError);

      await deleteJobDescriptionHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Access denied. You do not have permission to delete this job description.',
        403
      );
    });
  });

  // =========================================================================
  // 7. saveMockInterviewJobDescriptionHandler
  // =========================================================================
  describe('saveMockInterviewJobDescriptionHandler', () => {
    test('saves mock interview job description session and returns 201', async () => {
      const mockSaved = {
        id: 101,
        roleId: 'backend',
        title: 'Backend Developer',
        jobDescription: 'Build microservices with Node.js.',
      };
      req.body = {
        roleId: 'backend',
        roleTitle: 'Backend Developer',
        jobDescription: 'Build microservices with Node.js.',
      };
      req.user = { id: 4 };
      saveSelectedJobDescription.mockResolvedValue(mockSaved);

      await saveMockInterviewJobDescriptionHandler(req, res);

      expect(saveSelectedJobDescription).toHaveBeenCalledWith(req.body, req.user);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Mock interview job description saved successfully.',
        { jobDescription: mockSaved },
        201
      );
    });

    test('handles error during save and returns appropriate status code', async () => {
      req.body = { jobDescription: 'Valid description' };
      const error = new Error('Failed to save session');
      error.statusCode = 500;
      saveSelectedJobDescription.mockRejectedValue(error);

      await saveMockInterviewJobDescriptionHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Failed to save session', 500);
    });
  });
});
