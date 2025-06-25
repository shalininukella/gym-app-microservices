import axios from 'axios';
import { User } from "../types/user";

const API_BASE_URL = "https://reeqj2nzk7.execute-api.eu-west-3.amazonaws.com/dev";

/**
 * Parse JWT token to extract user information
 */
export const parseJwt = (token: string): { 
  userId: string; 
  email: string; 
  type: string; 
  firstName: string;
  lastName: string;
  exp?: number;
} | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    console.error('Failed to parse JWT token');
    return null;
  }
};

/**
 * Get user data from token and verify with backend
 */
export const getUserFromToken = async (): Promise<User | null> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const decodedToken = parseJwt(token);
    
    if (!decodedToken) {
      return null;
    }
    
    // Verify token and get user details from backend
    const response = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.user;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user from token:', error);
    localStorage.removeItem('token'); // Clear invalid token
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = parseJwt(token);
    if (!decoded) return true;
    
    // Get current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token has an expiration and if it's expired
    return decoded.exp ? decoded.exp < currentTime : false;
  } catch {
    return true;
  }
};

/**
 * Login user and get JWT token
 */
export const loginUser = async (email: string, password: string): Promise<{ user: User | null; token: string | null }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });

    if (response.data.success) {
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return { user, token };
    }

    return { user: null, token: null };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, token: null };
  }
};

/**
 * Register new user
 */
export const registerUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  type: 'client' | 'coach' | 'admin';
}): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed'
    };
  }
};

/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem('token');
}; 