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

/**
 * Submits candidate answers for an assessment and triggers auto-grading.
 * @param {string|number} id - Assessment ID or code (e.g., A-1001)
 * @param {object} submissionData - { answers, timeSpentSeconds }
 * @returns {Promise<object>} Response containing created/updated submission record.
 */
export const submitAssessment = async (id, submissionData) => {
  const response = await apiInstance.post(`/assessments/${id}/submit`, submissionData);
  return response.data;
};

/**
 * Fetches all assessment submissions made by the logged-in candidate.
 * @returns {Promise<object>} Response containing candidate submissions array.
 */
export const fetchMySubmissions = async () => {
  const response = await apiInstance.get('/assessments/my-submissions');
  return response.data;
};

/**
 * Fetches candidate submissions for a specific assessment or across all recruiter assessments.
 * @param {string|number|null} [assessmentId=null] - Optional assessment ID or code
 * @returns {Promise<object>} Response containing submissions array.
 */
export const fetchAssessmentSubmissions = async (assessmentId = null) => {
  const url = assessmentId ? `/assessments/${assessmentId}/submissions` : '/assessments/submissions';
  const response = await apiInstance.get(url);
  return response.data;
};

/**
 * Retrieves the detailed evaluation report for a single candidate submission.
 * @param {string|number} submissionId - Submission ID or code (e.g., SUB-1001)
 * @returns {Promise<object>} Response containing detailed submission report.
 */
export const fetchSubmissionReport = async (submissionId) => {
  const response = await apiInstance.get(`/assessments/submissions/${submissionId}`);
  return response.data;
};

/**
 * Saves recruiter manual scores, feedback comments, scorecard, and Shortlist/Reject decision.
 * @param {string|number} submissionId - Submission ID or code
 * @param {object} evaluationData - { manualScores, comments, recommendation, evaluatorNotes, recruiterScorecard }
 * @returns {Promise<object>} Response containing updated submission report.
 */
export const evaluateSubmission = async (submissionId, evaluationData) => {
  const response = await apiInstance.put(`/assessments/submissions/${submissionId}/evaluate`, evaluationData);
  return response.data;
};

