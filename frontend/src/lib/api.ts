import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// ── Request interceptor — attach JWT ──────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ll_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — handle errors globally ─────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const detail = err.response?.data?.detail ?? err.response?.data?.message ?? 'An error occurred';

    if (status === 401) {
      localStorage.removeItem('ll_access_token');
      localStorage.removeItem('ll_user');
      // Redirect only if not already on auth pages
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    } else if (status === 429) {
      toast.error('Too many requests — please slow down.');
    } else if (status === 403) {
      toast.error(detail || 'Access denied.');
    } else if (status && status >= 500) {
      toast.error('Server error — please try again.');
    }

    return Promise.reject(err);
  },
);

export default api;
