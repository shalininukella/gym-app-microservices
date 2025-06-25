 import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggleButton() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun size={25} className="text-gray-500 dark:text-gray-300" />
      ) : (
        <Moon size={25} className="text-gray-500 dark:text-gray-300" />
      )}
    </button>
  );
}