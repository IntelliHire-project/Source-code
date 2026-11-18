const express = require('express');
const { verifyToken } = require('../services/tokenService');
const {
  validateCreateRole,
  validateUpdateRole,
  validateUserRoleAccess,
  validateCreateJobDescription,
  validateUpdateJobDescription,
} = require('../middlewares/mockInterviewValidation');
const {
  createJobRoleHandler,
  getJobRolesHandler,
  getAvailableRolesHandler,
  getJobRoleByIdHandler,
  getJobRoleCategoriesHandler,
  updateJobRoleHandler,
  deleteJobRoleHandler,
  storeSelectedRoleHandler,
  getSelectedRoleHandler,
  clearSelectedRoleHandler,
} = require('../controllers/mockInterviewRoleController');
const {
  createJobDescriptionHandler,
  getJobDescriptionsHandler,
  getJobDescriptionByIdHandler,
  getLatestJobDescriptionHandler,
  updateJobDescriptionHandler,
  deleteJobDescriptionHandler,
  saveMockInterviewJobDescriptionHandler,
} = require('../controllers/mockInterviewJobDescriptionController');

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

// 3. Selected Role endpoints (Must precede parameterized /:id routes)
router.post('/roles/selected', optionalAuth, storeSelectedRoleHandler);
router.get('/roles/selected', optionalAuth, getSelectedRoleHandler);
router.delete('/roles/selected', optionalAuth, clearSelectedRoleHandler);
router.post('/selected-role', optionalAuth, storeSelectedRoleHandler);
router.get('/selected-role', optionalAuth, getSelectedRoleHandler);
router.post('/select-role', optionalAuth, storeSelectedRoleHandler);

// 4. Job Description endpoints (Must precede parameterized /:id routes)
router.post('/job-descriptions/save', optionalAuth, validateUserRoleAccess, validateCreateJobDescription, saveMockInterviewJobDescriptionHandler);
router.post('/job-description/save', optionalAuth, validateUserRoleAccess, validateCreateJobDescription, saveMockInterviewJobDescriptionHandler);

router.get('/job-descriptions/latest', optionalAuth, getLatestJobDescriptionHandler);
router.get('/job-description/latest', optionalAuth, getLatestJobDescriptionHandler);

router.post('/job-descriptions', optionalAuth, validateUserRoleAccess, validateCreateJobDescription, createJobDescriptionHandler);
router.get('/job-descriptions', optionalAuth, getJobDescriptionsHandler);
router.get('/job-descriptions/:id', optionalAuth, getJobDescriptionByIdHandler);
router.put('/job-descriptions/:id', optionalAuth, validateUserRoleAccess, validateUpdateJobDescription, updateJobDescriptionHandler);
router.delete('/job-descriptions/:id', optionalAuth, validateUserRoleAccess, deleteJobDescriptionHandler);

router.post('/job-description', optionalAuth, validateUserRoleAccess, validateCreateJobDescription, createJobDescriptionHandler);
router.get('/job-description', optionalAuth, getJobDescriptionsHandler);
router.get('/job-description/:id', optionalAuth, getJobDescriptionByIdHandler);
router.put('/job-description/:id', optionalAuth, validateUserRoleAccess, validateUpdateJobDescription, updateJobDescriptionHandler);
router.delete('/job-description/:id', optionalAuth, validateUserRoleAccess, deleteJobDescriptionHandler);

// 5. Roles subpath endpoints (e.g. /mock-interviews/roles)
router.post('/roles', optionalAuth, validateUserRoleAccess, validateCreateRole, createJobRoleHandler);
router.get('/roles', optionalAuth, getJobRolesHandler);
router.get('/roles/:id', optionalAuth, getJobRoleByIdHandler);
router.put('/roles/:id', optionalAuth, validateUserRoleAccess, validateUpdateRole, updateJobRoleHandler);
router.delete('/roles/:id', optionalAuth, validateUserRoleAccess, deleteJobRoleHandler);

// 6. Direct endpoints when mounted directly on a path (e.g. /job-roles or /api/job-roles)
router.post('/', optionalAuth, validateUserRoleAccess, validateCreateRole, createJobRoleHandler);
router.get('/', optionalAuth, getJobRolesHandler);
router.get('/:id', optionalAuth, getJobRoleByIdHandler);
router.put('/:id', optionalAuth, validateUserRoleAccess, validateUpdateRole, updateJobRoleHandler);
router.delete('/:id', optionalAuth, validateUserRoleAccess, deleteJobRoleHandler);

module.exports = router;
