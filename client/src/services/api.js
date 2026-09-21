import axios from 'axios';

/**
 * Resolves the backend API URL dynamically based on Vite environment variables.
 * In production (Vercel), requests target the deployed Render backend (VITE_API_URL).
 * In local development, requests connect to localhost:3000/api.
 */
const resolveApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    let url = envUrl.trim().replace(/^['"]+|['"]+$/g, '');
    if (url === '/api') {
      return '/api';
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    // Strip trailing slashes
    url = url.replace(/\/+$/, '');
    // Ensure /api suffix
    if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }
    return url;
  }

  // Local development fallback: connect directly to Express server on port 3000
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:3000/api';
  }

  // Production fallback if VITE_API_URL wasn't injected at build time
  return 'https://campus-skill-exchange-api.onrender.com/api';
};

export const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token to outgoing requests and block unauthenticated protected calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const url = config.url || '';
    const isPublicEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/health') ||
      url.includes('/contact');

    if (!token && !isPublicEndpoint) {
      const err = new Error('Authentication required: You must be logged in to access this resource.');
      err.customMessage = 'Please log in to access this feature.';
      err.isUnauthenticatedClientAbort = true;
      return Promise.reject(err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthUrl =
        error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthUrl) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'An unexpected error occurred.';

    error.customMessage = message;
    return Promise.reject(error);
  }
);

export default api;
