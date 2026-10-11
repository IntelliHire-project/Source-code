const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { verifyToken } = require('../services/tokenService');
const {
  createVacancyHandler,
  getVacancyHandler,
  getVacanciesHandler,
  updateVacancyHandler,
  closeVacancyHandler,
} = require('../controllers/vacancyController');

const router = express.Router();

/**
 * Optional authentication helper:
 * populates req.user if a valid Bearer token is sent, otherwise proceeds as guest.
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

// Create a new vacancy (recruiters and admins)
router.post('/', authMiddleware, roleMiddleware('recruiter', 'admin'), createVacancyHandler);

// List vacancies (search, filter, pagination)
router.get('/', optionalAuth, getVacanciesHandler);

// Retrieve a vacancy by ID or vacancy_code (e.g., VAC-001)
router.get('/:id', optionalAuth, getVacancyHandler);

// Update an existing vacancy
router.put('/:id', authMiddleware, roleMiddleware('recruiter', 'admin'), updateVacancyHandler);

// Close an active vacancy
router.patch('/:id/close', authMiddleware, roleMiddleware('recruiter', 'admin'), closeVacancyHandler);

module.exports = router;
