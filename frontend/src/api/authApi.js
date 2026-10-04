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

/**
 * Requests a password reset link.
 */
export const requestPasswordReset = async email => {
  const response = await apiInstance.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Validates the current session token with the backend and fetches fresh user details.
 */
export const getCurrentUser = async () => {
  const response = await apiInstance.get('/auth/me');
  return response.data;
};

/**
 * Notifies the backend that the user is logging out.
 */
export const logoutUser = async () => {
  try {
    const response = await apiInstance.post('/auth/logout');
    return response.data;
  } catch {
    // If offline or network error, frontend still clears local session
    return null;
  }
};

/**
 * Changes the user's password.
 */
export const changePassword = async (currentPassword, newPassword) => {
  const response = await apiInstance.post('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

