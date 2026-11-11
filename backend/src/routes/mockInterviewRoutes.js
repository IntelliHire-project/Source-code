const express = require('express');
const { verifyToken } = require('../services/tokenService');
const {
  createJobRoleHandler,
  getJobRolesHandler,
  getJobRoleByIdHandler,
  getJobRoleCategoriesHandler,
  updateJobRoleHandler,
  deleteJobRoleHandler,
} = require('../controllers/mockInterviewRoleController');

const router = express.Router();

/**
 * Optional authentication helper:
 * populates req.user if a valid Bearer token is provided.
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
      // Invalid or expired token is ignored for optional endpoints
    }
  }
  next();
};

// 1. Categories
router.get('/categories', optionalAuth, getJobRoleCategoriesHandler);
router.get('/roles/categories', optionalAuth, getJobRoleCategoriesHandler);

// 2. Roles subpath endpoints (e.g. /mock-interviews/roles)
router.post('/roles', optionalAuth, createJobRoleHandler);
router.get('/roles', optionalAuth, getJobRolesHandler);
router.get('/roles/:id', optionalAuth, getJobRoleByIdHandler);
router.put('/roles/:id', optionalAuth, updateJobRoleHandler);
router.delete('/roles/:id', optionalAuth, deleteJobRoleHandler);

// 3. Direct endpoints when mounted directly on a path (e.g. /job-roles or /api/mock-interview/roles)
router.post('/', optionalAuth, createJobRoleHandler);
router.get('/', optionalAuth, getJobRolesHandler);
router.get('/:id', optionalAuth, getJobRoleByIdHandler);
router.put('/:id', optionalAuth, updateJobRoleHandler);
router.delete('/:id', optionalAuth, deleteJobRoleHandler);

module.exports = router;

