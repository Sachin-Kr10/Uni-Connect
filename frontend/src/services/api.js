import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies (refresh token)
});

// Response interceptor to handle 401 & 403 errors (token refresh)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops if the refresh endpoint itself fails or no token
    if (originalRequest.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token using the HttpOnly cookie
        const res = await api.get('/auth/refresh');
        const newAccessToken = res.data.accessToken;
        
        // Update the default Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Update the failed request's Authorization header
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, user is fully logged out (cookie expired or missing)
        // Let the AuthContext handle redirection
        console.error('Session expired, please log in again.');
        // Could dispatch a custom event here that AuthContext listens to
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      }
    }

    // Pass any other errors back
    return Promise.reject(error);
  }
);

export default api;
