import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../../types/user';
import { logoutUser } from '../../utils/auth';

// Load from localStorage
const storedUser = localStorage.getItem('user');
const storedAuth = localStorage.getItem('isAuthenticated');

const initialState: AuthState = {
  isAuthenticated: storedAuth === 'true',
  user: storedUser ? JSON.parse(storedUser) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;

      // Save to localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      // Clear token from localStorage
      logoutUser();
      
      // Update Redux state
      state.isAuthenticated = false;
      state.user = null;

      // Remove from localStorage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
