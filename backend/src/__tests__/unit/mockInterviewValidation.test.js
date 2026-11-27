jest.mock('../../utils/response', () => ({
  errorResponse: jest.fn(),
  successResponse: jest.fn(),
}));

const { errorResponse } = require('../../utils/response');
const {
  validateCreateRole,
  validateUpdateRole,
  validateUserRoleAccess,
  validateCreateJobDescription,
  validateUpdateJobDescription,
  validateSaveJobDescription,
  validateAnalyzeJobDescription,
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

  describe('validateCreateJobDescription', () => {
    test('passes when valid payload is provided', () => {
      req.body = {
        title: 'Senior Full Stack Engineer',
        roleId: 'backend',
        jobDescription: 'Seeking an experienced engineer proficient in Node.js, React, and PostgreSQL.',
        experienceLevel: 'senior',
        skills: ['Node.js', 'React', 'PostgreSQL'],
      };

      validateCreateJobDescription(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(errorResponse).not.toHaveBeenCalled();
      expect(req.body.jobDescription).toBe(
        'Seeking an experienced engineer proficient in Node.js, React, and PostgreSQL.'
      );
      expect(req.body.title).toBe('Senior Full Stack Engineer');
      expect(req.body.roleId).toBe('backend');
      expect(req.body.skills).toEqual(['Node.js', 'React', 'PostgreSQL']);
    });

    test('accepts alternate description keys (description or content)', () => {
      req.body = {
        description: 'Design and implement REST APIs and scalable microservices.',
      };

      validateCreateJobDescription(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(errorResponse).not.toHaveBeenCalled();
      expect(req.body.jobDescription).toBe(
        'Design and implement REST APIs and scalable microservices.'
      );
    });

    test('rejects missing or empty job description', () => {
      req.body = { jobDescription: '   ' };

      validateCreateJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job description is required and must be a non-empty string.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects job description shorter than 5 characters', () => {
      req.body = { jobDescription: 'Dev' };

      validateCreateJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job description must be at least 5 characters long.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects job description exceeding 50,000 characters', () => {
      req.body = { jobDescription: 'a'.repeat(50001) };

      validateCreateJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job description cannot exceed 50,000 characters.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects invalid title exceeding 150 characters', () => {
      req.body = {
        jobDescription: 'Valid job description text for candidate role.',
        title: 'T'.repeat(151),
      };

      validateCreateJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Title cannot exceed 150 characters.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects non-string title', () => {
      req.body = {
        jobDescription: 'Valid job description text for candidate role.',
        title: 12345,
      };

      validateCreateJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Title must be a string.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects non-string roleId', () => {
      req.body = {
        jobDescription: 'Valid job description text for candidate role.',
        roleId: { id: 'backend' },
      };

      validateCreateJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Role identifier (roleId) must be a string.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects non-string experienceLevel', () => {
      req.body = {
        jobDescription: 'Valid job description text for candidate role.',
        experienceLevel: 3,
      };

      validateCreateJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Experience level must be a string.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('parses comma-separated skills string into array of strings', () => {
      req.body = {
        jobDescription: 'Valid job description text for candidate role.',
        skills: 'JavaScript, TypeScript, Docker',
      };

      validateCreateJobDescription(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.body.skills).toEqual(['JavaScript', 'TypeScript', 'Docker']);
    });

    test('rejects invalid skills format when not array or string', () => {
      req.body = {
        jobDescription: 'Valid job description text for candidate role.',
        skills: 9999,
      };

      validateCreateJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Skills must be an array of strings or a comma-separated string.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateUpdateJobDescription', () => {
    test('passes when valid update payload is provided', () => {
      req.body = {
        title: 'Updated Role Title',
        jobDescription: 'Updated job description details with sufficient length.',
        experienceLevel: 'lead',
        skills: ['Kubernetes', 'Go'],
      };

      validateUpdateJobDescription(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(errorResponse).not.toHaveBeenCalled();
      expect(req.body.title).toBe('Updated Role Title');
    });

    test('rejects empty request body on update', () => {
      req.body = {};

      validateUpdateJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'At least one field to update must be provided.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('validates jobDescription on update when empty', () => {
      req.body = { jobDescription: '   ' };

      validateUpdateJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job description cannot be empty.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects update jobDescription shorter than 5 characters', () => {
      req.body = { jobDescription: 'Hi' };

      validateUpdateJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job description must be at least 5 characters long.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('validates title on update when empty', () => {
      req.body = { title: '   ' };

      validateUpdateJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Title cannot be empty.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('validates title on update when exceeding 150 characters', () => {
      req.body = { title: 'T'.repeat(151) };

      validateUpdateJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Title cannot exceed 150 characters.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('parses comma-separated skills on update', () => {
      req.body = { skills: 'Express, Jest' };

      validateUpdateJobDescription(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.body.skills).toEqual(['Express', 'Jest']);
    });
  });

  describe('validateSaveJobDescription', () => {
    test('passes and sets empty string when jobDescription is omitted (optional step)', () => {
      req.body = {
        roleId: 'backend',
        title: 'Backend Developer',
      };

      validateSaveJobDescription(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(errorResponse).not.toHaveBeenCalled();
      expect(req.body.jobDescription).toBe('');
      expect(req.body.roleId).toBe('backend');
    });

    test('passes with trimmed string when jobDescription is provided', () => {
      req.body = {
        jobDescription: '   Building scalable distributed systems with Node.js.   ',
      };

      validateSaveJobDescription(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(errorResponse).not.toHaveBeenCalled();
      expect(req.body.jobDescription).toBe(
        'Building scalable distributed systems with Node.js.'
      );
    });

    test('rejects non-string jobDescription', () => {
      req.body = { jobDescription: 12345 };

      validateSaveJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job description must be a string.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects jobDescription exceeding 50,000 characters', () => {
      req.body = { jobDescription: 'x'.repeat(50001) };

      validateSaveJobDescription(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job description cannot exceed 50,000 characters.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('trims title and roleId when provided', () => {
      req.body = {
        title: '   DevOps Lead   ',
        roleId: '   devops-1   ',
      };

      validateSaveJobDescription(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.body.title).toBe('DevOps Lead');
      expect(req.body.roleId).toBe('devops-1');
    });
  });

  describe('validateAnalyzeJobDescription', () => {
    test('passes with valid jobDescription and normalizes comma-separated skills', () => {
      req.body = {
        jobDescription: '  Senior React engineer with 4+ years experience.  ',
        roleId: 'frontend',
        roleTitle: 'Frontend Developer',
        category: 'engineering',
        skills: 'React, TypeScript, CSS',
      };

      validateAnalyzeJobDescription(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(errorResponse).not.toHaveBeenCalled();
      expect(req.body.jobDescription).toBe('Senior React engineer with 4+ years experience.');
      expect(req.body.skills).toEqual(['React', 'TypeScript', 'CSS']);
    });

    test('accepts alternate description or content keys', () => {
      req.body = { content: 'Backend engineer with Node.js and PostgreSQL.' };

      validateAnalyzeJobDescription(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.body.jobDescription).toBe('Backend engineer with Node.js and PostgreSQL.');
    });

    test('rejects missing or short jobDescription', () => {
      req.body = { jobDescription: '   ' };
      validateAnalyzeJobDescription(req, res, next);
      expect(errorResponse).toHaveBeenCalledWith(res, 'Job description is required for analysis.', 400);

      jest.clearAllMocks();
      req.body = { jobDescription: 'Dev' };
      validateAnalyzeJobDescription(req, res, next);
      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Job description must be at least 5 characters long.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects invalid skills type or non-string metadata', () => {
      req.body = { jobDescription: 'Valid job description text.', skills: { react: true } };
      validateAnalyzeJobDescription(req, res, next);
      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Skills must be an array of strings or a comma-separated string.',
        400
      );

      jest.clearAllMocks();
      req.body = { jobDescription: 'Valid job description text.', roleId: 99 };
      validateAnalyzeJobDescription(req, res, next);
      expect(errorResponse).toHaveBeenCalledWith(
        res,
        'Role identifier (roleId) must be a string.',
        400
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});

