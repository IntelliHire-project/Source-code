jest.mock('../../utils/response', () => ({
  errorResponse: jest.fn(),
  successResponse: jest.fn(),
}));

const { errorResponse } = require('../../utils/response');
const {
  validateCreateRole,
  validateUpdateRole,
  validateUserRoleAccess,
  ALLOWED_CATEGORIES,
} = require('../../middlewares/mockInterviewValidation');

describe('mockInterviewValidation Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { body: {}, user: null, params: {} };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('validateCreateRole', () => {
    test('passes when valid payload is provided', () => {
      req.body = {
        title: 'DevOps Engineer',
        category: 'engineering',
        description: 'Managing cloud infrastructure and CI/CD pipelines.',
        skills: ['Docker', 'Kubernetes', 'AWS'],
        icon: 'Server',
      };

      validateCreateRole(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(errorResponse).not.toHaveBeenCalled();
      expect(req.body.title).toBe('DevOps Engineer');
      expect(req.body.category).toBe('engineering');
      expect(req.body.skills).toEqual(['Docker', 'Kubernetes', 'AWS']);
    });

    test('rejects missing or empty title', () => {
      req.body = { title: '   ' };

      validateCreateRole(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Role title is required and must be a non-empty string.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects title shorter than 2 characters', () => {
      req.body = { title: 'A' };

      validateCreateRole(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Role title must be at least 2 characters long.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects title longer than 100 characters', () => {
      req.body = { title: 'A'.repeat(101) };

      validateCreateRole(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Role title must not exceed 100 characters.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects title without alphabetic characters', () => {
      req.body = { title: '123456!@#' };

      validateCreateRole(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Role title must contain at least one alphabetic character.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects category "all"', () => {
      req.body = { title: 'Data Scientist', category: 'all' };

      validateCreateRole(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        expect.stringContaining("Category cannot be 'all'"),
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects an unsupported category', () => {
      req.body = { title: 'Data Scientist', category: 'finance' };

      validateCreateRole(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        expect.stringContaining("Invalid category 'finance'"),
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('normalizes category to lowercase', () => {
      req.body = { title: 'Lead Architect', category: ' ENGINEERING ' };

      validateCreateRole(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.body.category).toBe('engineering');
    });

    test('rejects description exceeding 1000 characters', () => {
      req.body = { title: 'QA Specialist', description: 'x'.repeat(1001) };

      validateCreateRole(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Description cannot exceed 1000 characters.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('parses comma-separated skills string into array', () => {
      req.body = { title: 'Fullstack Dev', skills: 'React, Node.js, PostgreSQL' };

      validateCreateRole(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.body.skills).toEqual(['React', 'Node.js', 'PostgreSQL']);
    });

    test('rejects more than 30 skills', () => {
      const skills = Array.from({ length: 31 }, (_, i) => `Skill ${i}`);
      req.body = { title: 'Architect', skills };

      validateCreateRole(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Cannot specify more than 30 skills for a single job role.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects an individual skill exceeding 50 characters', () => {
      req.body = { title: 'Specialist', skills: ['Short Skill', 'S'.repeat(51)] };

      validateCreateRole(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        expect.stringContaining('exceeds maximum length of 50 characters.'),
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects icon exceeding 50 characters', () => {
      req.body = { title: 'Mobile Dev', icon: 'I'.repeat(51) };

      validateCreateRole(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Icon identifier cannot exceed 50 characters.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateUpdateRole', () => {
    test('passes when valid partial update payload is provided', () => {
      req.body = { description: 'Updated role description.' };

      validateUpdateRole(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(errorResponse).not.toHaveBeenCalled();
    });

    test('rejects empty request body', () => {
      req.body = {};

      validateUpdateRole(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'At least one field to update must be provided.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('validates title on update if supplied', () => {
      req.body = { title: ' ' };

      validateUpdateRole(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Role title cannot be empty.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('validates category on update if supplied', () => {
      req.body = { category: 'invalid-cat' };

      validateUpdateRole(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        expect.stringContaining('Invalid category'),
        400
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateUserRoleAccess', () => {
    test('allows candidate, recruiter, and admin roles', () => {
      ['candidate', 'recruiter', 'admin'].forEach((role) => {
        req.user = { id: 1, role };
        next.mockClear();

        validateUserRoleAccess(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
      });
      expect(errorResponse).not.toHaveBeenCalled();
    });

    test('allows unauthenticated requests to pass through optionalAuth', () => {
      req.user = null;

      validateUserRoleAccess(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(errorResponse).not.toHaveBeenCalled();
    });

    test('rejects unauthorized user role', () => {
      req.user = { id: 2, role: 'external_guest' };

      validateUserRoleAccess(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Access denied. Your user role does not have permission to manage mock interview roles.',
        403
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});

