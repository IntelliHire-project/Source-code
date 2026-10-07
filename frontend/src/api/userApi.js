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
