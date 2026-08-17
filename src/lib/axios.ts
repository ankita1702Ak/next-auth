import axios, { AxiosError } from 'axios';

// Central axios instance. The session cookie is httpOnly, so we don't (and can't)
// attach it manually — `withCredentials` makes sure it's sent automatically.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — hook point for things like request IDs, loading state, etc.
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor — global 401/403 handling so pages don't repeat this logic.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (typeof window !== 'undefined') {
      if (status === 401) {
        // Session missing/expired/invalid — bounce to login.
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        // Authenticated but wrong role for this resource.
        console.warn('Forbidden: insufficient role for this action.');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
