import apiInstance from './apiInstance';

/**
 * Creates a new question in the question bank.
 * @param {object} questionData
 * @returns {Promise<object>}
 */
export const createQuestion = async (questionData) => {
  const response = await apiInstance.post('/questions', questionData);
  return response.data;
};

/**
 * Fetches questions with optional filters, search, and pagination.
 * @param {object} [params]
 * @returns {Promise<object>}
 */
export const fetchQuestions = async (params = {}) => {
  const response = await apiInstance.get('/questions', { params });
  return response.data;
};

/**
 * Retrieves a single question by its numeric ID or question code (e.g. Q-1001).
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export const getQuestionById = async (id) => {
  const response = await apiInstance.get(`/questions/${id}`);
  return response.data;
};

/**
 * Updates an existing question.
 * @param {string|number} id
 * @param {object} questionData
 * @returns {Promise<object>}
 */
export const updateQuestion = async (id, questionData) => {
  const response = await apiInstance.put(`/questions/${id}`, questionData);
  return response.data;
};

/**
 * Deletes a question from the question bank.
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export const deleteQuestion = async (id) => {
  const response = await apiInstance.delete(`/questions/${id}`);
  return response.data;
};

/**
 * Fetches summary statistics of questions (counts by difficulty & type).
 * @returns {Promise<object>}
 */
export const fetchQuestionStats = async () => {
  const response = await apiInstance.get('/questions/meta/stats');
  return response.data;
};

