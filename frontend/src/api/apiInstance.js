import axios from 'axios';
import { getToken, clearAuthSession } from '../services/storage';

const apiInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT authentication headers
apiInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: automatically handles expired or invalid sessions (HTTP 401)
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Do not redirect if the 401 is from sign-in or account creation (invalid credentials)
      const requestUrl = error.config?.url || '';
      const isAuthAttempt = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/create-account');

      if (!isAuthAttempt) {
        clearAuthSession();

        if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
          window.location.href = '/signin?session_expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiInstance;
