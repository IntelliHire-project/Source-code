import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { signup as apiSignup, login as apiLogin, getCurrentUser, logoutUser } from '../api/authApi';
import {
  getToken,
  getUser,
  saveAuthSession,
  clearAuthSession,
  isTokenExpired,
} from '../services/storage';

export const AuthContext = createContext(null);

// Inactivity timeout: 2 hours (in milliseconds)
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef(Date.now());

  // Logout handler: informs backend, cleans local storage, and resets state
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      clearAuthSession();
      setUser(null);
    }
  }, []);

  // Initial session hydration and server-side verification
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();

      if (!token || isTokenExpired(token)) {
        clearAuthSession();
        setUser(null);
        setLoading(false);
        return;
      }

      // Fast render with cached user
      const cachedUser = getUser();
      if (cachedUser) {
        setUser(cachedUser);
      }

      // Validate session with the backend
      try {
        const response = await getCurrentUser();
        if (response?.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        // If server rejected token (401), clean up
        if (error.response?.status === 401) {
          clearAuthSession();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Idle Inactivity Detection
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((event) => window.addEventListener(event, updateActivity, { passive: true }));

    const inactivityInterval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_TIMEOUT_MS) {
        logout();
        if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
          window.location.href = '/signin?session_expired=true';
        }
      }
    }, 60 * 1000); // Check once per minute

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, updateActivity));
      clearInterval(inactivityInterval);
    };
  }, [user, logout]);

  const signup = async (...args) => {
    setLoading(true);
    try {
      const data = await apiSignup(...args);
      if (data.token && data.user) {
        saveAuthSession(data.token, data.user, false);
        setUser(data.user);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, rememberDevice = false) => {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      if (data.token && data.user) {
        saveAuthSession(data.token, data.user, rememberDevice);
        setUser(data.user);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const updateAuthUser = useCallback((newUserData) => {
    setUser((prevUser) => {
      const updatedUser = { ...prevUser, ...newUserData };
      // Also update local storage if it exists
      const token = getToken();
      if (token) {
        saveAuthSession(token, updatedUser, !!localStorage.getItem('token'));
      }
      return updatedUser;
    });
  }, []);

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    updateAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
