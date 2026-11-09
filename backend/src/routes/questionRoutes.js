const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { verifyToken } = require('../services/tokenService');
const {
  createQuestionHandler,
  getQuestionsHandler,
  getQuestionHandler,
  updateQuestionHandler,
  deleteQuestionHandler,
  getQuestionStatsHandler,
} = require('../controllers/questionController');

const router = express.Router();

/**
 * Optional authentication helper:
 * Populates req.user if a valid Bearer token is sent, otherwise proceeds.
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
      // Invalid/expired token ignored on optional routes
    }
  }
  next();
};

// 1. Analytics & Stats (MUST be placed before /:id so 'stats' isn't parsed as a question ID)
router.get('/meta/stats', optionalAuth, getQuestionStatsHandler);
router.get('/stats', optionalAuth, getQuestionStatsHandler);

// 2. List questions (search, filtering, pagination)
router.get('/', optionalAuth, getQuestionsHandler);

// 3. Retrieve a single question by ID or code (e.g., Q-1001)
router.get('/:id', optionalAuth, getQuestionHandler);

// 4. Create a new question (recruiter or admin)
router.post('/', authMiddleware, roleMiddleware('recruiter', 'admin'), createQuestionHandler);

// 5. Update an existing question (recruiter or admin)
router.put('/:id', authMiddleware, roleMiddleware('recruiter', 'admin'), updateQuestionHandler);

// 6. Delete a question (recruiter or admin)
router.delete('/:id', authMiddleware, roleMiddleware('recruiter', 'admin'), deleteQuestionHandler);

module.exports = router;

