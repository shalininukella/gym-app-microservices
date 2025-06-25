import axios from 'axios';

// Base URL for API calls
export const API_BASE_URL = 'https://reeqj2nzk7.execute-api.eu-west-3.amazonaws.com/dev';

// Create an axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
});

// Auth header utility
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };
};

// Add auth headers to requests when needed
export const authApi = {
  get: async (url: string) => {
    return api.get(url, { 
      headers: { ...getAuthHeader() }
    });
  },
  post: async (url: string, data: any) => {
    return api.post(url, data, { 
      headers: { ...getAuthHeader() }
    });
  },
  put: async (url: string, data: any) => {
    return api.put(url, data, { 
      headers: { ...getAuthHeader() }
    });
  },
  delete: async (url: string) => {
    return api.delete(url, { 
      headers: { ...getAuthHeader() }
    });
  }
}; 