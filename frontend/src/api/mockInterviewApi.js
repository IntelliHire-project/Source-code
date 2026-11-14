import apiInstance from './apiInstance';

/**
 * Fetches all available job roles for candidate mock interview preparation.
 * @param {object} [params] - e.g. { category, search, sortBy }
 * @returns {Promise<object>}
 */
export const fetchAvailableRoles = async (params = {}) => {
  try {
    const response = await apiInstance.get('/mock-interviews/roles/available', { params });
    return response.data;
  } catch (error) {
    // Graceful fallback to standard /mock-interviews/roles endpoint
    const fallback = await apiInstance.get('/mock-interviews/roles', { params });
    return fallback.data;
  }
};

/**
 * Fetches all job roles with optional search and category filters.
 * @param {object} [params]
 * @returns {Promise<object>}
 */
export const fetchJobRoles = async (params = {}) => {
  const response = await apiInstance.get('/mock-interviews/roles', { params });
  return response.data;
};

/**
 * Retrieves a single job role by ID or slug.
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export const getJobRoleById = async (id) => {
  const response = await apiInstance.get(`/mock-interviews/roles/${id}`);
  return response.data;
};

/**
 * Fetches all available job role categories with active counts.
 * @returns {Promise<object>}
 */
export const fetchJobRoleCategories = async () => {
  const response = await apiInstance.get('/mock-interviews/categories');
  return response.data;
};

/**
 * Creates a new custom job role for mock interview.
 * @param {object} roleData
 * @returns {Promise<object>}
 */
export const createCustomJobRole = async (roleData) => {
  const response = await apiInstance.post('/mock-interviews/roles', roleData);
  return response.data;
};

/**
 * Stores the candidate's selected job role for the mock interview session.
 * @param {object} selectionData - { roleId, roleTitle, jobDescription, interviewMode }
 * @returns {Promise<object>}
 */
export const storeSelectedRole = async (selectionData) => {
  const response = await apiInstance.post('/mock-interviews/roles/selected', selectionData);
  return response.data;
};

/**
 * Retrieves the candidate's currently selected job role.
 * @returns {Promise<object>}
 */
export const fetchSelectedRole = async () => {
  const response = await apiInstance.get('/mock-interviews/roles/selected');
  return response.data;
};

