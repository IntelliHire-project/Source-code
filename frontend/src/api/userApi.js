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

  const response = await apiInstance.post('/cv/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
