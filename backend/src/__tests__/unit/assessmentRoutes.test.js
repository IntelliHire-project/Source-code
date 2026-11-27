const router = require('../../routes/assessmentRoutes');
const { verifyToken } = require('../../services/tokenService');

jest.mock('../../services/tokenService', () => ({
  verifyToken: jest.fn(),
  generateToken: jest.fn(),
}));

jest.mock('../../controllers/assessmentController', () => ({
  createAssessmentHandler: jest.fn(),
  getAssessmentsHandler: jest.fn(),
  getAssessmentHandler: jest.fn(),
  updateAssessmentHandler: jest.fn(),
  deleteAssessmentHandler: jest.fn(),
  getAssessmentStatsHandler: jest.fn(),
}));

describe('assessmentRoutes Unit Tests', () => {
  test('registers all required routes and methods on the router', () => {
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));

    expect(routes).toContainEqual({ path: '/meta/stats', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/stats', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['put'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['delete'] });
  });

  test('places /meta/stats and /stats before /:id in route stack to prevent id capture', () => {
    const paths = router.stack
      .filter((layer) => layer.route)
      .map((layer) => layer.route.path);

    const statsIndex = paths.indexOf('/stats');
    const metaStatsIndex = paths.indexOf('/meta/stats');
    const paramIdIndex = paths.indexOf('/:id');

    expect(metaStatsIndex).toBeLessThan(paramIdIndex);
    expect(statsIndex).toBeLessThan(paramIdIndex);
  });

  test('optionalAuth middleware attaches decoded token to req.user when valid Bearer token provided', () => {
    // Find optionalAuth middleware from the first route stack
    const getRouteLayer = router.stack.find((l) => l.route && l.route.path === '/');
    const optionalAuthMiddleware = getRouteLayer.route.stack[0].handle;

    const req = {
      headers: {
        authorization: 'Bearer valid.jwt.token',
      },
    };
    const res = {};
    const next = jest.fn();

    verifyToken.mockReturnValueOnce({
      id: 42,
      email: 'recruiter@intellihire.com',
      fullName: 'Jane Recruiter',
      role: 'recruiter',
    });

    optionalAuthMiddleware(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith('valid.jwt.token');
    expect(req.user).toEqual({
      id: 42,
      email: 'recruiter@intellihire.com',
      fullName: 'Jane Recruiter',
      role: 'recruiter',
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('optionalAuth middleware proceeds gracefully when authorization header is absent', () => {
    const getRouteLayer = router.stack.find((l) => l.route && l.route.path === '/');
    const optionalAuthMiddleware = getRouteLayer.route.stack[0].handle;

    const req = { headers: {} };
    const res = {};
    const next = jest.fn();

    optionalAuthMiddleware(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('optionalAuth middleware ignores invalid token and does not throw', () => {
    const getRouteLayer = router.stack.find((l) => l.route && l.route.path === '/');
    const optionalAuthMiddleware = getRouteLayer.route.stack[0].handle;

    const req = {
      headers: {
        authorization: 'Bearer corrupted.token',
      },
    };
    const res = {};
    const next = jest.fn();

    verifyToken.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    optionalAuthMiddleware(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
