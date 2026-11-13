jest.mock('../../models/assessmentModel', () => ({
  createAssessment: jest.fn(),
  findAssessmentByIdOrCode: jest.fn(),
  findAllAssessments: jest.fn(),
  updateAssessment: jest.fn(),
  deleteAssessment: jest.fn(),
  getAssessmentStats: jest.fn(),
}));

jest.mock('../../models/recruiterModel', () => ({
  findRecruiterByUserId: jest.fn(),
}));

jest.mock('../../utils/response', () => ({
  successResponse: jest.fn((res, message, data, statusCode = 200) =>
    res.status(statusCode).json({ working: true, message, ...data })
  ),
  errorResponse: jest.fn((res, message, statusCode = 400) =>
    res.status(statusCode).json({ working: false, message })
  ),
}));

const {
  createAssessment,
  findAssessmentByIdOrCode,
  findAllAssessments,
  updateAssessment,
  deleteAssessment,
  getAssessmentStats,
} = require('../../models/assessmentModel');
const { findRecruiterByUserId } = require('../../models/recruiterModel');
const { successResponse, errorResponse } = require('../../utils/response');
const {
  createAssessmentHandler,
  getAssessmentsHandler,
  getAssessmentHandler,
  updateAssessmentHandler,
  deleteAssessmentHandler,
  getAssessmentStatsHandler,
} = require('../../controllers/assessmentController');

describe('assessmentController Unit Tests', () => {
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

  describe('createAssessmentHandler', () => {
    test('returns 400 when title or name is missing', async () => {
      req.body = { description: 'No title' };

      await createAssessmentHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Assessment title is required and cannot be empty.',
        400
      );
      expect(createAssessment).not.toHaveBeenCalled();
    });

    test('creates assessment successfully and returns 201', async () => {
      req.user = { id: 10, role: 'recruiter' };
      req.body = {
        title: 'React Senior Assessment',
        jobRole: 'Frontend Lead',
        duration: 90,
      };

      findRecruiterByUserId.mockResolvedValueOnce({ id: 5 });
      createAssessment.mockResolvedValueOnce({
        id: 'A-1001',
        title: 'React Senior Assessment',
        duration: 90,
      });

      await createAssessmentHandler(req, res);

      expect(findRecruiterByUserId).toHaveBeenCalledWith(10);
      expect(createAssessment).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'React Senior Assessment' }),
        10,
        5
      );
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Assessment created successfully.',
        expect.objectContaining({ assessment: expect.any(Object) }),
        201
      );
    });

    test('handles controller error with custom status code', async () => {
      req.body = { title: 'Test' };
      const err = new Error('Database down');
      err.statusCode = 503;
      createAssessment.mockRejectedValueOnce(err);

      await createAssessmentHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Database down', 503);
    });
  });

  describe('getAssessmentsHandler', () => {
    test('lists assessments with pagination and filters', async () => {
      req.query = {
        search: 'React',
        page: '1',
        limit: '10',
      };

      findAllAssessments.mockResolvedValueOnce({
        assessments: [{ id: 'A-1001', title: 'React Assessment' }],
        total: 1,
      });

      await getAssessmentsHandler(req, res);

      expect(findAllAssessments).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'React',
          limit: 10,
          offset: 0,
        })
      );
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Assessments retrieved successfully.',
        expect.objectContaining({
          assessments: expect.any(Array),
          pagination: expect.objectContaining({ total: 1, page: 1, totalPages: 1 }),
        })
      );
    });

    test('filters by recruiter when scope=mine', async () => {
      req.user = { id: 7, role: 'recruiter' };
      req.query = { scope: 'mine' };
      findRecruiterByUserId.mockResolvedValueOnce({ id: 3 });
      findAllAssessments.mockResolvedValueOnce({ assessments: [], total: 0 });

      await getAssessmentsHandler(req, res);

      expect(findAllAssessments).toHaveBeenCalledWith(
        expect.objectContaining({ recruiterId: 3 })
      );
    });
  });

  describe('getAssessmentHandler', () => {
    test('returns 400 when id param is missing', async () => {
      req.params = {};

      await getAssessmentHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Assessment ID or code is required.',
        400
      );
    });

    test('returns 404 when assessment does not exist', async () => {
      req.params = { id: 'A-999' };
      findAssessmentByIdOrCode.mockResolvedValueOnce(null);

      await getAssessmentHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Assessment not found.', 404);
    });

    test('returns 200 with assessment when found', async () => {
      req.params = { id: 'A-1001' };
      findAssessmentByIdOrCode.mockResolvedValueOnce({
        id: 'A-1001',
        title: 'Backend Test',
      });

      await getAssessmentHandler(req, res);

      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Assessment retrieved successfully.',
        { assessment: expect.objectContaining({ id: 'A-1001' }) }
      );
    });
  });

  describe('updateAssessmentHandler', () => {
    test('returns 400 when id param is missing', async () => {
      req.params = {};

      await updateAssessmentHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Assessment ID or code is required.',
        400
      );
    });

    test('updates assessment successfully', async () => {
      req.params = { id: 'A-1001' };
      req.user = { id: 10, role: 'recruiter' };
      req.body = { title: 'Updated Title' };

      findRecruiterByUserId.mockResolvedValueOnce({ id: 5 });
      updateAssessment.mockResolvedValueOnce({
        id: 'A-1001',
        title: 'Updated Title',
      });

      await updateAssessmentHandler(req, res);

      expect(updateAssessment).toHaveBeenCalledWith(
        'A-1001',
        { title: 'Updated Title' },
        10,
        5
      );
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Assessment updated successfully.',
        { assessment: expect.objectContaining({ title: 'Updated Title' }) }
      );
    });

    test('handles 403 authorization error from model', async () => {
      req.params = { id: 'A-1001' };
      const err = new Error('You do not have permission to edit this assessment');
      err.statusCode = 403;
      updateAssessment.mockRejectedValueOnce(err);

      await updateAssessmentHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'You do not have permission to edit this assessment',
        403
      );
    });
  });

  describe('deleteAssessmentHandler', () => {
    test('returns 400 when id param is missing', async () => {
      req.params = {};

      await deleteAssessmentHandler(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Assessment ID or code is required.',
        400
      );
    });

    test('deletes assessment successfully', async () => {
      req.params = { id: 'A-1001' };
      req.user = { id: 10, role: 'recruiter' };
      findRecruiterByUserId.mockResolvedValueOnce({ id: 5 });
      deleteAssessment.mockResolvedValueOnce({ success: true });

      await deleteAssessmentHandler(req, res);

      expect(deleteAssessment).toHaveBeenCalledWith('A-1001', 10, 5);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Assessment deleted successfully.'
      );
    });
  });

  describe('getAssessmentStatsHandler', () => {
    test('retrieves statistics successfully', async () => {
      req.user = { id: 10, role: 'recruiter' };
      findRecruiterByUserId.mockResolvedValueOnce({ id: 5 });
      getAssessmentStats.mockResolvedValueOnce({
        total: 8,
        active: 5,
        draft: 2,
        archived: 1,
      });

      await getAssessmentStatsHandler(req, res);

      expect(getAssessmentStats).toHaveBeenCalledWith(5);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        'Assessment statistics retrieved successfully.',
        { stats: { total: 8, active: 5, draft: 2, archived: 1 } }
      );
    });
  });
});

