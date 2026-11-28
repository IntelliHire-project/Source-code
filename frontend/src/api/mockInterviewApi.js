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

/**
 * Creates a new job description for mock interview preparation.
 * @param {object} jdData - { jobDescription, roleId, title, skills, experienceLevel }
 * @returns {Promise<object>}
 */
export const createJobDescription = async (jdData) => {
  const response = await apiInstance.post('/mock-interviews/job-descriptions', jdData);
  return response.data;
};

/**
 * Saves/submits a job description for the candidate's mock interview session.
 * Stores in the job descriptions repository and syncs with selected role.
 * @param {object} jdData - { jobDescription, roleId, roleTitle, category, skills, experienceLevel }
 * @returns {Promise<object>}
 */
export const saveMockInterviewJobDescription = async (jdData) => {
  try {
    const response = await apiInstance.post('/mock-interviews/job-descriptions/save', jdData);
    return response.data;
  } catch (error) {
    // Graceful fallback to selected-role endpoint if standalone endpoint is unavailable
    const fallback = await apiInstance.post('/mock-interviews/roles/selected', jdData);
    return fallback.data;
  }
};

/**
 * Fetches all job descriptions with optional search and filters.
 * @param {object} [params] - { roleId, search }
 * @returns {Promise<object>}
 */
export const fetchJobDescriptions = async (params = {}) => {
  const response = await apiInstance.get('/mock-interviews/job-descriptions', { params });
  return response.data;
};

/**
 * Retrieves a single job description by ID.
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export const getJobDescriptionById = async (id) => {
  const response = await apiInstance.get(`/mock-interviews/job-descriptions/${id}`);
  return response.data;
};

/**
 * Retrieves the candidate's latest mock interview job description.
 * @returns {Promise<object>}
 */
export const fetchLatestJobDescription = async () => {
  const response = await apiInstance.get('/mock-interviews/job-descriptions/latest');
  return response.data;
};

/**
 * Updates an existing job description.
 * @param {string|number} id
 * @param {object} jdData
 * @returns {Promise<object>}
 */
export const updateJobDescription = async (id, jdData) => {
  const response = await apiInstance.put(`/mock-interviews/job-descriptions/${id}`, jdData);
  return response.data;
};

/**
 * Deletes a job description by ID.
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export const deleteJobDescription = async (id) => {
  const response = await apiInstance.delete(`/mock-interviews/job-descriptions/${id}`);
  return response.data;
};

/**
 * Retrieves the integrated job description template and any saved JD for a specific job role.
 * @param {string} roleId
 * @returns {Promise<object>}
 */
export const fetchRoleIntegratedJobDescription = async (roleId) => {
  const response = await apiInstance.get(`/mock-interviews/roles/${roleId}/job-description`);
  return response.data;
};

/**
 * Attaches and integrates a job description directly to the candidate's selected job role.
 * @param {object} integrationData - { roleId, jobDescription, roleTitle, category, skills }
 * @returns {Promise<object>}
 */
export const attachJobDescriptionToSelectedRole = async (integrationData) => {
  try {
    const response = await apiInstance.post('/mock-interviews/roles/selected/job-description', integrationData);
    return response.data;
  } catch (error) {
    // Fallback to storing via selected role endpoint
    const fallback = await apiInstance.post('/mock-interviews/roles/selected', integrationData);
    return fallback.data;
  }
};

/**
 * Retrieves the currently active job description for the candidate's selected role session.
 * @returns {Promise<object>}
 */
export const fetchSelectedRoleJobDescription = async () => {
  try {
    const response = await apiInstance.get('/mock-interviews/roles/selected/job-description');
    return response.data;
  } catch (error) {
    const fallback = await apiInstance.get('/mock-interviews/job-descriptions/latest');
    return fallback.data;
  }
};

/**
 * Updates the job description attached to the currently selected role.
 * @param {object} updateData - { roleId, jobDescription, roleTitle, category }
 * @returns {Promise<object>}
 */
export const updateSelectedRoleJobDescription = async (updateData) => {
  try {
    const response = await apiInstance.put('/mock-interviews/roles/selected/job-description', updateData);
    return response.data;
  } catch (error) {
    const fallback = await apiInstance.post('/mock-interviews/roles/selected/job-description', updateData);
    return fallback.data;
  }
};

/**
 * Runs AI Job Description Analysis for a mock interview job description.
 * Returns structured skills, seniority, focus areas, prep tips, and tailored questions.
 * @param {object} jdData - { jobDescription, roleId, roleTitle, category, skills, jdId }
 * @returns {Promise<object>}
 */
export const analyzeMockInterviewJobDescription = async (jdData) => {
  const response = await apiInstance.post('/mock-interviews/job-descriptions/analyze', jdData);
  return response.data;
};

/**
 * Generates mock interview questions integrated with a job description and its AI analysis.
 * @param {object} payload - { jobDescription, jdAnalysis, roleId, roleTitle, category, skills, questionCount, focusType, difficulty, excludeDescriptions, variantSeed, jdId }
 * @returns {Promise<object>}
 */
export const generateMockInterviewQuestions = async (payload) => {
  const response = await apiInstance.post('/mock-interviews/questions/generate', payload);
  return response.data;
};




