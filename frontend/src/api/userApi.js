import apiInstance from './apiInstance';

/**
 * Fetches the list of registered users (admin only).
 */
export const fetchUsers = async () => {
  const response = await apiInstance.get('/users');
  return response.data;
};
