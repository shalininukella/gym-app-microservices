// src/utils/axiosConfig.ts
import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: "https://reeqj2nzk7.execute-api.eu-west-3.amazonaws.com/dev"
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth/sign-in';
    }
    
    return Promise.reject(error);
  }
);

export default api;