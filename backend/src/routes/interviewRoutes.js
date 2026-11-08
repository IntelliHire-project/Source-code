const express = require('express');
const { verifyToken } = require('../services/tokenService');
const {
  getSlotsHandler,
  getSlotByIdHandler,
  createSlotHandler,
  bulkCreateSlotsHandler,
  updateSlotHandler,
  deleteSlotHandler,
  allocateCandidateHandler,
  getAllocationsHandler,
  deleteAllocationHandler,
  resetAllocationsHandler,
  autoAllocateHandler,
  getRescheduleRequestsHandler,
  createRescheduleRequestHandler,
  approveRescheduleRequestHandler,
  rejectRescheduleRequestHandler,
  customRescheduleHandler,
  submitEvaluationHandler,
  getEvaluationsHandler,
  getPanelMembersHandler,
  clearAllSlotsHandler,
} = require('../controllers/interviewController');

const router = express.Router();

/**
 * Optional authentication helper:
 * populates req.user if a valid Bearer token is sent, otherwise proceeds.
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

// Panel members
router.get('/panel-members', optionalAuth, getPanelMembersHandler);

// Interview Slots
router.delete('/slots-clear-all', optionalAuth, clearAllSlotsHandler);
router.get('/slots', optionalAuth, getSlotsHandler);
router.get('/slots/:id', optionalAuth, getSlotByIdHandler);
router.post('/slots', optionalAuth, createSlotHandler);
router.post('/slots/bulk', optionalAuth, bulkCreateSlotsHandler);
router.put('/slots/:id', optionalAuth, updateSlotHandler);
router.delete('/slots/:id', optionalAuth, deleteSlotHandler);

// Allocations
router.get('/allocations', optionalAuth, getAllocationsHandler);
router.post('/allocate', optionalAuth, allocateCandidateHandler);
router.post('/slots/:slotId/allocate', optionalAuth, allocateCandidateHandler);
router.post('/auto-allocate', optionalAuth, autoAllocateHandler);
router.delete('/allocations-reset', optionalAuth, resetAllocationsHandler);
router.delete('/allocations/:id', optionalAuth, deleteAllocationHandler);

// Reschedule Requests
router.get('/reschedule-requests', optionalAuth, getRescheduleRequestsHandler);
router.post('/reschedule-requests', optionalAuth, createRescheduleRequestHandler);
router.put('/reschedule-requests/:id/approve', optionalAuth, approveRescheduleRequestHandler);
router.put('/reschedule-requests/:id/reject', optionalAuth, rejectRescheduleRequestHandler);
router.put('/reschedule-requests/:id/custom', optionalAuth, customRescheduleHandler);

// Evaluations
router.get('/evaluations', optionalAuth, getEvaluationsHandler);
router.post('/evaluations', optionalAuth, submitEvaluationHandler);

module.exports = router;

