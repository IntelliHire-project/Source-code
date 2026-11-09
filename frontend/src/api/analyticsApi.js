import apiInstance from './apiInstance';

/**
 * Fetch applicant analytics data
 * @param {object} [params] - { position, department, search }
 * @returns {Promise<object>}
 */
export const fetchApplicantAnalytics = async (params = {}) => {
  const response = await apiInstance.get('/analytics/applicants', { params });
  return response.data;
};

/**
 * Fetch assessment analytics data
 * @returns {Promise<object>}
 */
export const fetchAssessmentAnalytics = async () => {
  const response = await apiInstance.get('/analytics/assessments');
  return response.data;
};

/**
 * Fetch shortlisting analytics data
 * @param {object} [params] - { role, status, search }
 * @returns {Promise<object>}
 */
export const fetchShortlistingAnalytics = async (params = {}) => {
  const response = await apiInstance.get('/analytics/shortlisting', { params });
  return response.data;
};

/**
 * Fetch recruitment progress analytics data
 * @returns {Promise<object>}
 */
export const fetchRecruitmentProgress = async () => {
  const response = await apiInstance.get('/analytics/progress');
  return response.data;
};

/**
 * Fetch overview analytics data
 * @returns {Promise<object>}
 */
export const fetchOverviewAnalytics = async () => {
  const response = await apiInstance.get('/analytics/overview');
  return response.data;
};

