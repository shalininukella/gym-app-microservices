 import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import { useAuth } from "./hooks/useAuth";
import { useAppSelector } from "./hooks/redux";

const App: React.FC = () => {
  useAuth();
  
  // Get the current theme from Redux store using the correct property name
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);
  
  // Apply dark mode class to the html element and update localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
 
export default App;