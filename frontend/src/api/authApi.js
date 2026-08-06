import apiInstance from './apiInstance';

/**
 * Sends a signup request to the backend.
 */
export const signup = async (fullName, email, phone, password, confirmPassword, role = 'candidate') => {
  const response = await apiInstance.post('/auth/create-account', {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    role,
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

/**
 * Verifies a user's email address using a verification token.
 */
export const verifyEmail = async token => {
  const response = await apiInstance.get('/auth/verify-email', {
    params: { token },
  });
  return response.data;
};

/**
 * Requests a new verification link for an account.
 */
export const resendVerification = async email => {
  const response = await apiInstance.post('/auth/resend-verification', { email });
  return response.data;
};
