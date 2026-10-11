import axios from 'axios';

// Priority: VITE_API_BASE_URL > production default > local development proxy
const getBaseURL = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  }
  // In production outside local dev, default to the live Render backend
  if (import.meta.env.PROD) {
    return 'https://procurex-api-gpwt.onrender.com/api/v1';
  }
  return '/api/v1';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach token if stored in localStorage (for fallback)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('procurex_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      // Clear token and let context handle it
      localStorage.removeItem('procurex_token');
    }
    return Promise.reject(error);
  }
);
