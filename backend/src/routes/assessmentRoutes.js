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
const {
  submitAssessmentHandler,
  getMySubmissionsHandler,
  getAssessmentSubmissionsHandler,
  getSubmissionReportHandler,
  evaluateSubmissionHandler,
} = require('../controllers/submissionController');

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

// 1. Aggregate Statistics & Submission Static Routes (MUST be placed before /:id)
router.get('/meta/stats', optionalAuth, getAssessmentStatsHandler);
router.get('/stats', optionalAuth, getAssessmentStatsHandler);
router.get('/my-submissions', authMiddleware, roleMiddleware('candidate', 'admin'), getMySubmissionsHandler);
router.get('/submissions', authMiddleware, roleMiddleware('recruiter', 'admin'), getAssessmentSubmissionsHandler);
router.get('/submissions/:submissionId', authMiddleware, roleMiddleware('recruiter', 'admin', 'candidate'), getSubmissionReportHandler);
router.put('/submissions/:submissionId/evaluate', authMiddleware, roleMiddleware('recruiter', 'admin'), evaluateSubmissionHandler);

// 2. List all assessments (with query filters, search, and pagination)
router.get('/', optionalAuth, getAssessmentsHandler);

// 3. Candidate submission & recruiter per-assessment submissions
router.post('/:id/submit', authMiddleware, roleMiddleware('candidate', 'admin'), submitAssessmentHandler);
router.get('/:id/submissions', authMiddleware, roleMiddleware('recruiter', 'admin'), getAssessmentSubmissionsHandler);

// 4. Retrieve a single assessment by ID or code (e.g., A-1001)
router.get('/:id', optionalAuth, getAssessmentHandler);

// 4. Create a new assessment (restricted to recruiter or admin)
router.post('/', authMiddleware, roleMiddleware('recruiter', 'admin'), createAssessmentHandler);

// 5. Update an assessment (restricted to recruiter or admin)
router.put('/:id', authMiddleware, roleMiddleware('recruiter', 'admin'), updateAssessmentHandler);

// 6. Delete an assessment (restricted to recruiter or admin)
router.delete('/:id', authMiddleware, roleMiddleware('recruiter', 'admin'), deleteAssessmentHandler);

module.exports = router;

