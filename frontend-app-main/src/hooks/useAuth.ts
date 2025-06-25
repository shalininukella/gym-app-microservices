import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { login } from '../store/slices/authSlice';
import { getUserFromToken } from '../utils/auth';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook for authentication and persistence
 * Use this in App.tsx or other global component to maintain authentication state
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Check for token and restore auth state on initial load
  useEffect(() => {
    const initAuth = async () => {
      if (!isAuthenticated) {
        const userData = await getUserFromToken();
        if (userData) {
          dispatch(login(userData));
          
          // Handle user type-specific redirects on page refresh
          handleUserTypeRedirects(userData.type);
        }
      } else if (user) {
        // Handle redirects for already authenticated users
        handleUserTypeRedirects(user.type);
      }
    };

    // Helper function to handle redirects based on user type
    const handleUserTypeRedirects = (userType: string) => {
      const currentPath = location.pathname;
      
      // Only redirect if we're on a path that doesn't match the user type
      if (userType === 'coach' && currentPath === '/') {
        navigate('/coachpage');
      } else if (userType === 'admin' && currentPath === '/') {
        navigate('/admin/reports');
      } else if (userType !== 'coach' && currentPath === '/coachpage') {
        navigate('/');
      } else if (userType !== 'admin' && (currentPath === '/adminpage' || currentPath === '/admin/reports')) {
        navigate('/');
      }
    };

    initAuth();
  }, [dispatch, isAuthenticated, navigate, location.pathname, user]);

  return { isAuthenticated, user };
}; 