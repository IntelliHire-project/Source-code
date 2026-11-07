import apiInstance from './apiInstance';

/**
 * Fetch all interview slots with optional filters
 * @param {object} [params] - e.g. { vacancyId, status, round, date }
 * @returns {Promise<object>}
 */
export const fetchInterviewSlots = async (params = {}) => {
  const response = await apiInstance.get('/interviews/slots', { params });
  return response.data;
};

/**
 * Fetch single interview slot by ID
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export const fetchInterviewSlotById = async (id) => {
  const response = await apiInstance.get(`/interviews/slots/${id}`);
  return response.data;
};

/**
 * Create a new interview slot
 * @param {object} slotData
 * @returns {Promise<object>}
 */
export const createInterviewSlot = async (slotData) => {
  const response = await apiInstance.post('/interviews/slots', slotData);
  return response.data;
};

/**
 * Bulk create interview slots
 * @param {Array} slots
 * @returns {Promise<object>}
 */
export const bulkCreateInterviewSlots = async (slots) => {
  const response = await apiInstance.post('/interviews/slots/bulk', { slots });
  return response.data;
};

/**
 * Update an existing interview slot
 * @param {string|number} id
 * @param {object} slotData
 * @returns {Promise<object>}
 */
export const updateInterviewSlot = async (id, slotData) => {
  const response = await apiInstance.put(`/interviews/slots/${id}`, slotData);
  return response.data;
};

/**
 * Delete an interview slot
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export const deleteInterviewSlot = async (id) => {
  const response = await apiInstance.delete(`/interviews/slots/${id}`);
  return response.data;
};

/**
 * Allocate a candidate to a slot
 * @param {string|number} slotId
 * @param {object} candidateData
 * @returns {Promise<object>}
 */
export const allocateCandidate = async (slotId, candidateData) => {
  const response = await apiInstance.post(`/interviews/slots/${slotId}/allocate`, candidateData);
  return response.data;
};

/**
 * Fetch all candidate interview allocations
 * @returns {Promise<object>}
 */
export const fetchAllocations = async () => {
  const response = await apiInstance.get('/interviews/allocations');
  return response.data;
};

/**
 * Auto-allocate candidates to available slots
 * @param {Array} candidates
 * @returns {Promise<object>}
 */
export const autoAllocateCandidates = async (candidates) => {
  const response = await apiInstance.post('/interviews/auto-allocate', { candidates });
  return response.data;
};

/**
 * Delete / remove a candidate allocation
 * @param {string|number} candidateId
 * @returns {Promise<object>}
 */
export const deleteAllocation = async (candidateId) => {
  const response = await apiInstance.delete(`/interviews/allocations/${candidateId}`);
  return response.data;
};

/**
 * Reset all interview allocations
 * @returns {Promise<object>}
 */
export const resetAllocations = async () => {
  const response = await apiInstance.delete('/interviews/allocations-reset');
  return response.data;
};

/**
 * Fetch all interview reschedule requests
 * @returns {Promise<object>}
 */
export const fetchRescheduleRequests = async () => {
  const response = await apiInstance.get('/interviews/reschedule-requests');
  return response.data;
};

/**
 * Create/submit a reschedule request
 * @param {object} requestData
 * @returns {Promise<object>}
 */
export const createRescheduleRequest = async (requestData) => {
  const response = await apiInstance.post('/interviews/reschedule-requests', requestData);
  return response.data;
};

/**
 * Approve a reschedule request
 * @param {string|number} requestId
 * @param {object} payload - { selectedProposedSlot, recruiterNotes }
 * @returns {Promise<object>}
 */
export const approveRescheduleRequestApi = async (requestId, payload) => {
  const response = await apiInstance.put(`/interviews/reschedule-requests/${requestId}/approve`, payload);
  return response.data;
};

/**
 * Reject a reschedule request
 * @param {string|number} requestId
 * @param {object} payload - { rejectionReason }
 * @returns {Promise<object>}
 */
export const rejectRescheduleRequestApi = async (requestId, payload) => {
  const response = await apiInstance.put(`/interviews/reschedule-requests/${requestId}/reject`, payload);
  return response.data;
};

/**
 * Custom reschedule slot
 * @param {string|number} requestId
 * @param {object} payload - { customSlotData, notes }
 * @returns {Promise<object>}
 */
export const customRescheduleSlotApi = async (requestId, payload) => {
  const response = await apiInstance.put(`/interviews/reschedule-requests/${requestId}/custom`, payload);
  return response.data;
};

/**
 * Submit candidate evaluation
 * @param {object} evalData
 * @returns {Promise<object>}
 */
export const submitEvaluationApi = async (evalData) => {
  const response = await apiInstance.post('/interviews/evaluations', evalData);
  return response.data;
};

/**
 * Fetch all evaluations
 * @returns {Promise<object>}
 */
export const fetchEvaluations = async () => {
  const response = await apiInstance.get('/interviews/evaluations');
  return response.data;
};

/**
 * Fetch panel members
 * @returns {Promise<object>}
 */
export const fetchPanelMembers = async () => {
  const response = await apiInstance.get('/interviews/panel-members');
  return response.data;
};

