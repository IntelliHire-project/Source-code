const TOKEN_KEY = 'intellihire_token';
const USER_KEY = 'intellihire_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));

export const removeUser = () => localStorage.removeItem(USER_KEY);

export const clearAuthSession = () => {
  removeToken();
  removeUser();
};
