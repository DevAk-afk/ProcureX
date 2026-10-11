import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
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
