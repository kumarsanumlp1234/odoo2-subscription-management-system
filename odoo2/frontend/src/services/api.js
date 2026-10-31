import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('brightloop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Unpack data & handle 401
api.interceptors.response.use(
  (response) => {
    // If response contains standard ApiResponse { success, message, data }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('brightloop_token');
        localStorage.removeItem('brightloop_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // Extract server error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
      
    return Promise.reject(new Error(message));
  }
);

export default api;
