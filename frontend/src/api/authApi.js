import apiInstance from './apiInstance';

/**
 * Sends a signup request to the backend.
 * Supports both object payload and positional arguments for backwards compatibility.
 * Automatically switches to multipart/form-data when a CV file is included.
 */
export const signup = async (
  payloadOrFullName,
  email,
  phone,
  password,
  confirmPassword,
  role = 'candidate',
  extra = {}
) => {
  let payload = {};

  if (typeof payloadOrFullName === 'object' && payloadOrFullName !== null) {
    payload = { ...payloadOrFullName };
  } else {
    payload = {
      fullName: payloadOrFullName,
      email,
      phone,
      password,
      confirmPassword,
      role: role || 'candidate',
      ...extra,
    };
  }

  const cvFile = payload.cvFile || payload.cv;

  if (cvFile instanceof File) {
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      if (key === 'cvFile' || key === 'cv') {
        formData.append('cv', cvFile);
      } else if (payload[key] !== undefined && payload[key] !== null) {
        formData.append(key, payload[key]);
      }
    });

    const response = await apiInstance.post('/auth/create-account', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  const response = await apiInstance.post('/auth/create-account', payload);
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

/**
 * Fetches all CVs for the authenticated candidate.
 */
export const getCandidateCVs = async () => {
  const response = await apiInstance.get('/auth/candidate/cvs');
  return response.data;
};

/**
 * Uploads a new CV file for the candidate.
 * @param {File} file - The PDF or DOCX file
 * @param {boolean} [setActive=true] - Whether to activate this CV
 */
export const uploadCandidateCV = async (file, setActive = true) => {
  const formData = new FormData();
  formData.append('cv', file);
  formData.append('setActive', setActive);

  const response = await apiInstance.post('/auth/candidate/cvs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Sets a specific CV as active for the candidate.
 * @param {number} cvId 
 */
export const setActiveCandidateCV = async (cvId) => {
  const response = await apiInstance.put(`/auth/candidate/cvs/${cvId}/active`);
  return response.data;
};

/**
 * Deletes a CV from the candidate's account.
 * @param {number} cvId 
 */
export const deleteCandidateCV = async (cvId) => {
  const response = await apiInstance.delete(`/auth/candidate/cvs/${cvId}`);
  return response.data;
};
