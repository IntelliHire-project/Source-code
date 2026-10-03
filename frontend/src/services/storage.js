const TOKEN_KEY = 'intellihire_token';
const USER_KEY = 'intellihire_user';
const REMEMBER_KEY = 'intellihire_remember_device';

/**
 * Checks if a JWT token has expired.
 * @param {string} token - JWT token string
 * @returns {boolean} True if expired or invalid, false if active
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    if (!decoded.exp) return false;
    // Check if expiry timestamp (in seconds) has passed
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

/**
 * Retrieves the stored auth token from localStorage or sessionStorage.
 */
export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  if (token && isTokenExpired(token)) {
    clearAuthSession();
    return null;
  }
  return token;
};

/**
 * Retrieves the stored user object from localStorage or sessionStorage.
 */
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Checks if "Remember Device" was preferred.
 */
export const isRememberDevicePreferred = () => {
  return localStorage.getItem(REMEMBER_KEY) === 'true';
};

/**
 * Saves authenticated session into localStorage (if rememberDevice is true)
 * or sessionStorage (if rememberDevice is false).
 */
export const saveAuthSession = (token, user, rememberDevice = false) => {
  // Clear any existing opposite storage
  if (rememberDevice) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(REMEMBER_KEY, 'true');

    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.removeItem(REMEMBER_KEY);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Backwards-compatible setters/removers
 */
export const setToken = (token) => {
  const isRemember = isRememberDevicePreferred();
  if (isRemember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
};

export const setUser = (user) => {
  const isRemember = isRememberDevicePreferred();
  if (isRemember) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
};

/**
 * Clears all auth session data from both localStorage and sessionStorage.
 */
export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REMEMBER_KEY);

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem('hasChosenVacancy');
  sessionStorage.removeItem('selectedVacancyId');
};

