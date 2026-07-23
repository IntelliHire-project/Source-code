import apiInstance from './apiInstance';

/**
 * Sends a signup request to the backend.
 */
export const signup = async (fullName, email, phone, password, confirmPassword) => {
  const response = await apiInstance.post('/auth/create-account', {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
  });
  return response.data;
};

/**
 * Sends a login request to the backend.
 */
export const login = async (email, password) => {
  const response = await apiInstance.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};
