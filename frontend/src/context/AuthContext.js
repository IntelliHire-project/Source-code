import React, { createContext, useState, useEffect } from 'react';
import { signup as apiSignup, login as apiLogin } from '../api/authApi';
import { getUser, setUser as saveUserToStorage, setToken, clearAuthSession } from '../services/storage';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session load
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const signup = async (fullName, email, phone, password, confirmPassword) => {
    setLoading(true);
    try {
      const data = await apiSignup(fullName, email, phone, password, confirmPassword);
      // Auto session storage if token returned
      if (data.token) {
        setToken(data.token);
      }
      if (data.user) {
        setUser(data.user);
        saveUserToStorage(data.user);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      if (data.token) {
        setToken(data.token);
      }
      if (data.user) {
        setUser(data.user);
        saveUserToStorage(data.user);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContext;
