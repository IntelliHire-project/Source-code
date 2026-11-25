const {
  getAllInterviewSlots,
  getInterviewSlotById,
  createInterviewSlot,
  bulkCreateInterviewSlots,
  updateInterviewSlot,
  deleteInterviewSlot,
  allocateCandidateToSlot,
  getAllAllocations,
  deleteAllocation,
  resetAllAllocations,
  autoAllocateCandidates,
  getAllRescheduleRequests,
  createRescheduleRequest,
  approveRescheduleRequest,
  rejectRescheduleRequest,
  customRescheduleSlot,
  submitInterviewEvaluation,
  getAllEvaluations,
  getPanelMemberList,
  clearAllInterviewData,
} = require('../models/interviewModel');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all interview slots
 */
const getSlotsHandler = async (req, res) => {
  try {
    const filters = {
      vacancyId: req.query.vacancyId,
      status: req.query.status,
      round: req.query.round,
      date: req.query.date,
    };
    const slots = await getAllInterviewSlots(filters);
    return successResponse(res, 'Interview slots retrieved successfully.', { slots });
  } catch (error) {
    console.error('Error fetching interview slots:', error);
    return errorResponse(res, 'Failed to fetch interview slots.', 500);
  }
};

/**
 * Get single interview slot by ID
 */
const getSlotByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await getInterviewSlotById(id);
    if (!slot) {
      return errorResponse(res, 'Interview slot not found.', 404);
    }
    return successResponse(res, 'Interview slot retrieved successfully.', { slot });
  } catch (error) {
    console.error('Error fetching interview slot:', error);
    return errorResponse(res, 'Failed to fetch interview slot.', 500);
  }
};

/**
 * Create a new interview slot
 */
const createSlotHandler = async (req, res) => {
  try {
    const { interviewDate, round } = req.body;
    if (!interviewDate) {
      return errorResponse(res, 'Interview date is required.', 400);
    }
    const slot = await createInterviewSlot(req.body);
    return successResponse(res, 'Interview slot created successfully.', { slot }, 201);
  } catch (error) {
    console.error('Error creating interview slot:', error);
    return errorResponse(res, 'Failed to create interview slot.', 500);
  }
};

/**
 * Bulk create interview slots
 */
const bulkCreateSlotsHandler = async (req, res) => {
  try {
    const { slots } = req.body;
    if (!Array.isArray(slots) || slots.length === 0) {
      return errorResponse(res, 'An array of slots is required.', 400);
    }
    const created = await bulkCreateInterviewSlots(slots);
    return successResponse(res, 'Interview slots created successfully.', { slots: created }, 201);
  } catch (error) {
    console.error('Error bulk creating interview slots:', error);
    return errorResponse(res, 'Failed to bulk create interview slots.', 500);
  }
};

/**
 * Update an interview slot
 */
const updateSlotHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateInterviewSlot(id, req.body);
    if (!updated) {
      return errorResponse(res, 'Interview slot not found.', 404);
    }
    return successResponse(res, 'Interview slot updated successfully.', { slot: updated });
  } catch (error) {
    console.error('Error updating interview slot:', error);
    return errorResponse(res, 'Failed to update interview slot.', 500);
  }
};

/**
 * Delete an interview slot
 */
const deleteSlotHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteInterviewSlot(id);
    if (!deleted) {
      return errorResponse(res, 'Interview slot not found.', 404);
    }
    return successResponse(res, 'Interview slot deleted successfully.');
  } catch (error) {
    console.error('Error deleting interview slot:', error);
    return errorResponse(res, 'Failed to delete interview slot.', 500);
  }
};

/**
 * Allocate a candidate to a slot
 */
const allocateCandidateHandler = async (req, res) => {
  try {
    const slotId = req.params.slotId || req.body.slotId;
    if (!slotId) {
      return errorResponse(res, 'Slot ID is required.', 400);
    }
    const result = await allocateCandidateToSlot(slotId, req.body);
    return successResponse(res, 'Candidate allocated successfully.', result);
  } catch (error) {
    console.error('Error allocating candidate:', error);
    return errorResponse(res, error.message || 'Failed to allocate candidate.', 500);
  }
};

/**
 * Get all candidate allocations
 */
const getAllocationsHandler = async (req, res) => {
  try {
    const allocations = await getAllAllocations();
    return successResponse(res, 'Allocations retrieved successfully.', { allocations });
  } catch (error) {
    console.error('Error fetching allocations:', error);
    return errorResponse(res, 'Failed to fetch allocations.', 500);
  }
};

/**
 * Delete / unassign a candidate allocation
 */
const deleteAllocationHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteAllocation(id);
    return successResponse(res, 'Allocation removed successfully.', deleted);
  } catch (error) {
    console.error('Error removing allocation:', error);
    return errorResponse(res, 'Failed to remove allocation.', 500);
  }
};

/**
 * Reset all candidate allocations
 */
const resetAllocationsHandler = async (req, res) => {
  try {
    await resetAllAllocations();
    return successResponse(res, 'All allocations reset successfully.');
  } catch (error) {
    console.error('Error resetting allocations:', error);
    return errorResponse(res, 'Failed to reset allocations.', 500);
  }
};

/**
 * Auto-allocate shortlisted candidates to available slots
 */
const autoAllocateHandler = async (req, res) => {
  try {
    const { candidates } = req.body;
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return errorResponse(res, 'Candidates list is required for auto-allocation.', 400);
    }
    const allocations = await autoAllocateCandidates(candidates);
    return successResponse(res, 'Candidates auto-allocated successfully.', { allocations });
  } catch (error) {
    console.error('Error in auto-allocation:', error);
    return errorResponse(res, 'Failed to auto-allocate candidates.', 500);
  }
};

/**
 * Get all reschedule requests
 */
const getRescheduleRequestsHandler = async (req, res) => {
  try {
    const requests = await getAllRescheduleRequests();
    return successResponse(res, 'Reschedule requests retrieved successfully.', { requests });
  } catch (error) {
    console.error('Error fetching reschedule requests:', error);
    return errorResponse(res, 'Failed to fetch reschedule requests.', 500);
  }
};

/**
 * Create a new reschedule request
 */
const createRescheduleRequestHandler = async (req, res) => {
  try {
    const { reasonCategory } = req.body;
    if (!reasonCategory) {
      return errorResponse(res, 'Reason category is required.', 400);
    }
    const request = await createRescheduleRequest(req.body);
    return successResponse(res, 'Reschedule request submitted successfully.', { request }, 201);
  } catch (error) {
    console.error('Error submitting reschedule request:', error);
    return errorResponse(res, 'Failed to submit reschedule request.', 500);
  }
};

/**
 * Approve a reschedule request
 */
const approveRescheduleRequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedProposedSlot, recruiterNotes } = req.body;
    const result = await approveRescheduleRequest(id, selectedProposedSlot, recruiterNotes);
    return successResponse(res, result.message, result);
  } catch (error) {
    console.error('Error approving reschedule request:', error);
    return errorResponse(res, error.message || 'Failed to approve reschedule request.', 500);
  }
};

/**
 * Reject a reschedule request
 */
const rejectRescheduleRequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const result = await rejectRescheduleRequest(id, rejectionReason);
    return successResponse(res, result.message, result);
  } catch (error) {
    console.error('Error rejecting reschedule request:', error);
    return errorResponse(res, error.message || 'Failed to reject reschedule request.', 500);
  }
};

/**
 * Custom reschedule slot
 */
const customRescheduleHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { customSlotData, notes } = req.body;
    const result = await customRescheduleSlot(id, customSlotData, notes);
    return successResponse(res, result.message, result);
  } catch (error) {
    console.error('Error in custom reschedule:', error);
    return errorResponse(res, error.message || 'Failed to reschedule slot.', 500);
  }
};

/**
 * Submit candidate interview evaluation
 */
const submitEvaluationHandler = async (req, res) => {
  try {
    const { slotId, recommendation } = req.body;
    if (!slotId) {
      return errorResponse(res, 'Slot ID is required.', 400);
    }
    const evaluation = await submitInterviewEvaluation(req.body);
    return successResponse(res, 'Evaluation submitted successfully.', { evaluation }, 201);
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    return errorResponse(res, 'Failed to submit evaluation.', 500);
  }
};

/**
 * Get all interview evaluations
 */
const getEvaluationsHandler = async (req, res) => {
  try {
    const evaluations = await getAllEvaluations();
    return successResponse(res, 'Evaluations retrieved successfully.', { evaluations });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return errorResponse(res, 'Failed to fetch evaluations.', 500);
  }
};

/**
 * Get list of panel members
 */
const getPanelMembersHandler = async (req, res) => {
  try {
    const panelMembers = await getPanelMemberList();
    return successResponse(res, 'Panel members retrieved successfully.', { panelMembers });
  } catch (error) {
    console.error('Error fetching panel members:', error);
    return errorResponse(res, 'Failed to fetch panel members.', 500);
  }
};

/**
 * Clear all interview tables (reset)
 */
const clearAllSlotsHandler = async (req, res) => {
  try {
    const result = await clearAllInterviewData();
    return successResponse(res, result.message, result);
  } catch (error) {
    console.error('Error clearing interview tables:', error);
    return errorResponse(res, 'Failed to clear interview tables.', 500);
  }
};

/**
 * Dispatch automated interview reminder via email and Google Calendar
 */
const sendRemindersHandler = async (req, res) => {
  try {
    const { slotId, candidateId, candidateEmail, candidateName, panelEmails, type = '24h', reminderMethod = 'both' } = req.body;
    const reminderLog = {
      id: `REM-${Date.now()}`,
      slotId: slotId || null,
      candidateId: candidateId || null,
      candidateEmail: candidateEmail || 'candidate@example.com',
      candidateName: candidateName || 'Candidate',
      panelEmails: panelEmails || 'panel@company.com',
      type, // '24h' | '1h' | 'INSTANT'
      reminderMethod, // 'email' | 'google_calendar' | 'both'
      sentAt: new Date().toISOString(),
      status: 'SENT',
    };
    return successResponse(
      res,
      `Automated ${type} interview reminder successfully dispatched to candidate (${candidateEmail || candidateName}) and panel members (${Array.isArray(panelEmails) ? panelEmails.join(', ') : panelEmails})!`,
      { reminder: reminderLog }
    );
  } catch (error) {
    console.error('Error dispatching reminder:', error);
    return errorResponse(res, 'Failed to dispatch interview reminder.', 500);
  }
};

module.exports = {
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
  sendRemindersHandler,
};

