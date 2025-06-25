import api from '../axios';
import { SignInData, SignUpData } from '../../types/auth.ts';

export const authService = {
  async signIn(data: SignInData) {
    const response = await api.post('/auth/sign-in', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async signUp(data: SignUpData) {
    const response = await api.post('/auth/sign-up', data);
    return response.data;
  },

  async signOut() {
    localStorage.removeItem('token');
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }
}; 