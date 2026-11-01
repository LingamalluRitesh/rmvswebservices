import axios from 'axios';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api/v1`;
  }
  // If running in browser and not on localhost, default to the live backend URL
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) {
      return 'https://rmvs-backend.onrender.com/api/v1';
    }
  }
  return '/api/v1';
};

const apiBase = getApiBase();

const api = axios.create({
  baseURL: apiBase,
  timeout: 10000, // 10s maximum timeout to prevent frozen requests during server cold-starts
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rmvs_token') || localStorage.getItem('devconnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rmvs_token');
      localStorage.removeItem('devconnect_token');
      // If we are not on public or login/register pages, we can optionally redirect
    }
    return Promise.reject(error);
  }
);

export default api;
