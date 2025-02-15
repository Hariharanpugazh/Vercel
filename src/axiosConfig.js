import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000', // Use environment variable for base URL
  withCredentials: true, // Ensures cookies are sent with requests
});

// Helper function to retrieve CSRF token
const getCSRFToken = () => {
  const name = 'csrftoken';
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name))
    ?.split('=')[1];
  return cookieValue;
};

// Request interceptor to include tokens in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const csrfToken = getCSRFToken();
    if (csrfToken && !['get', 'head', 'options'].includes(config.method)) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('Refresh token not found');

        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        // Update tokens and retry request
        const newAccessToken = response.data.access;
        localStorage.setItem('accessToken', newAccessToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/studentlogin';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
