const express = require('express');
const { verifyToken } = require('../services/tokenService');
const {
  validateCreateRole,
  validateUpdateRole,
  validateUserRoleAccess,
} = require('../middlewares/mockInterviewValidation');
const {
  createJobRoleHandler,
  getJobRolesHandler,
  getAvailableRolesHandler,
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

// 1. Categories (Must precede parameterized /:id routes)
router.get('/categories', optionalAuth, getJobRoleCategoriesHandler);
router.get('/roles/categories', optionalAuth, getJobRoleCategoriesHandler);

// 2. Available Roles endpoints (Must precede parameterized /:id routes)
router.get('/roles/available', optionalAuth, getAvailableRolesHandler);
router.get('/available', optionalAuth, getAvailableRolesHandler);
router.get('/available-roles', optionalAuth, getAvailableRolesHandler);

// 3. Roles subpath endpoints (e.g. /mock-interviews/roles)
router.post('/roles', optionalAuth, validateUserRoleAccess, validateCreateRole, createJobRoleHandler);
router.get('/roles', optionalAuth, getJobRolesHandler);
router.get('/roles/:id', optionalAuth, getJobRoleByIdHandler);
router.put('/roles/:id', optionalAuth, validateUserRoleAccess, validateUpdateRole, updateJobRoleHandler);
router.delete('/roles/:id', optionalAuth, validateUserRoleAccess, deleteJobRoleHandler);

// 3. Direct endpoints when mounted directly on a path (e.g. /job-roles or /api/job-roles)
router.post('/', optionalAuth, validateUserRoleAccess, validateCreateRole, createJobRoleHandler);
router.get('/', optionalAuth, getJobRolesHandler);
router.get('/:id', optionalAuth, getJobRoleByIdHandler);
router.put('/:id', optionalAuth, validateUserRoleAccess, validateUpdateRole, updateJobRoleHandler);
router.delete('/:id', optionalAuth, validateUserRoleAccess, deleteJobRoleHandler);

module.exports = router;
