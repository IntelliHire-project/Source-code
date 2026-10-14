import apiInstance from './apiInstance';

/**
 * Fetches the list of registered users (admin only).
 */
export const fetchUsers = async () => {
  const response = await apiInstance.get('/users');
  return response.data;
};

/**
 * Uploads a CV and returns extracted skills and experience.
 * @param {File} file 
 */
export const uploadCV = async (file) => {
  const formData = new FormData();
  formData.append('cv', file);

  const response = await apiInstance.post('/cv/upload', formData);
  return response.data;
};

export const getCandidateProfile = async () => {
  const response = await apiInstance.get('/candidate/profile');
  return response.data;
};

export const updateCandidateProfile = async (profileData) => {
  const response = await apiInstance.put('/candidate/profile', profileData);
  return response.data;
};

/**
 * Updates a recruiter's approval status (admin only).
 */
export const updateRecruiterStatus = async (id, status) => {
  const response = await apiInstance.put(`/users/${id}/recruiter-status`, { status });
  return response.data;
};

/**
 * Updates user details (admin only).
 * @param {number|string} id 
 * @param {object} userData { name, email, role }
 */
export const updateUser = async (id, userData) => {
  const response = await apiInstance.put(`/users/${id}`, userData);
  return response.data;
};

/**
 * Updates a user's account status (active, inactive, pending) (admin only).
 * @param {number|string} id 
 * @param {'active'|'inactive'|'pending'} status 
 */
export const updateUserStatus = async (id, status) => {
  const response = await apiInstance.put(`/users/${id}/status`, { status });
  return response.data;
};
