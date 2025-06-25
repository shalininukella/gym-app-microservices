import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  useEffect(() => {
    // Update localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Update document class for Tailwind
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    console.log('Theme changed:', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  return <>{children}</>;
}
