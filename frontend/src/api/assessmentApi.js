import apiInstance from './apiInstance';

/**
 * Creates a new assessment in the system.
 * @param {object} assessmentData - Title, role, duration, difficulty, questions, settings, etc.
 * @returns {Promise<object>} Response containing created assessment and status message.
 */
export const createAssessment = async (assessmentData) => {
  const response = await apiInstance.post('/assessments', assessmentData);
  return response.data;
};

/**
 * Fetches a list of assessments with optional search, filtering, and pagination.
 * @param {object} [params] - Optional query params: { search, status, difficulty, jobRole, scope, page, limit, sortBy }
 * @returns {Promise<object>} Response containing assessments array and pagination metadata.
 */
export const fetchAssessments = async (params = {}) => {
  const response = await apiInstance.get('/assessments', { params });
  return response.data;
};

/**
 * Retrieves a single assessment by its numeric ID or assessment code (e.g., A-1001).
 * @param {string|number} id - Assessment ID or code
 * @returns {Promise<object>} Response containing assessment details and questions.
 */
export const getAssessmentById = async (id) => {
  const response = await apiInstance.get(`/assessments/${id}`);
  return response.data;
};

/**
 * Updates an existing assessment.
 * @param {string|number} id - Assessment ID or code
 * @param {object} assessmentData - Updated assessment fields
 * @returns {Promise<object>} Response containing updated assessment.
 */
export const updateAssessment = async (id, assessmentData) => {
  const response = await apiInstance.put(`/assessments/${id}`, assessmentData);
  return response.data;
};

/**
 * Deletes an assessment by ID or code.
 * @param {string|number} id - Assessment ID or code
 * @returns {Promise<object>} Response confirming deletion.
 */
export const deleteAssessment = async (id) => {
  const response = await apiInstance.delete(`/assessments/${id}`);
  return response.data;
};

/**
 * Fetches aggregate metrics for assessments (total, active, draft, archived counts).
 * @returns {Promise<object>} Response containing statistics object.
 */
export const fetchAssessmentStats = async () => {
  const response = await apiInstance.get('/assessments/meta/stats');
  return response.data;
};

