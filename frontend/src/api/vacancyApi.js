import apiInstance from './apiInstance';

/**
 * Creates a new vacancy (draft or published).
 * @param {object} vacancyData
 * @returns {Promise<object>}
 */
export const createVacancy = async (vacancyData) => {
  const response = await apiInstance.post('/vacancies', vacancyData);
  return response.data;
};

/**
 * Fetches vacancy details by ID or vacancy code (e.g. VAC-001).
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export const getVacancyById = async (id) => {
  const response = await apiInstance.get(`/vacancies/${id}`);
  return response.data;
};

/**
 * Fetches vacancies with search, filtering, and pagination.
 * @param {object} [params]
 * @returns {Promise<object>}
 */
export const fetchVacancies = async (params = {}) => {
  const response = await apiInstance.get('/vacancies', { params });
  return response.data;
};

/**
 * Updates an existing vacancy.
 * @param {string|number} id
 * @param {object} vacancyData
 * @returns {Promise<object>}
 */
export const updateVacancy = async (id, vacancyData) => {
  const response = await apiInstance.put(`/vacancies/${id}`, vacancyData);
  return response.data;
};

/**
 * Closes an active vacancy.
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export const closeVacancy = async (id) => {
  const response = await apiInstance.patch(`/vacancies/${id}/close`);
  return response.data;
};
