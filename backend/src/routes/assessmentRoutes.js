const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { verifyToken } = require('../services/tokenService');
const {
  createAssessmentHandler,
  getAssessmentsHandler,
  getAssessmentHandler,
  updateAssessmentHandler,
  deleteAssessmentHandler,
  getAssessmentStatsHandler,
} = require('../controllers/assessmentController');

const router = express.Router();

/**
 * Optional authentication helper:
 * Attaches req.user if a valid Bearer token is provided, but doesn't block the request if absent.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        fullName: decoded.fullName,
        role: decoded.role,
      };
    } catch (err) {
      // Non-fatal: proceed without req.user
    }
  }
  next();
};

// 1. Aggregate Statistics (MUST be placed before /:id so 'stats' or 'meta' is not captured as an ID)
router.get('/meta/stats', optionalAuth, getAssessmentStatsHandler);
router.get('/stats', optionalAuth, getAssessmentStatsHandler);

// 2. List all assessments (with query filters, search, and pagination)
router.get('/', optionalAuth, getAssessmentsHandler);

// 3. Retrieve a single assessment by ID or code (e.g., A-1001)
router.get('/:id', optionalAuth, getAssessmentHandler);

// 4. Create a new assessment (restricted to recruiter or admin)
router.post('/', authMiddleware, roleMiddleware('recruiter', 'admin'), createAssessmentHandler);

// 5. Update an assessment (restricted to recruiter or admin)
router.put('/:id', authMiddleware, roleMiddleware('recruiter', 'admin'), updateAssessmentHandler);

// 6. Delete an assessment (restricted to recruiter or admin)
router.delete('/:id', authMiddleware, roleMiddleware('recruiter', 'admin'), deleteAssessmentHandler);

module.exports = router;

