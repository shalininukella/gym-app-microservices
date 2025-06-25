 import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, UserCircle, Menu, X } from "lucide-react";
import Logo from "../../assets/thunder-icon.svg";
import ProfileDropdown from "./ProfileDropdown";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { logout } from "../../store/slices/authSlice";
import { ThemeToggleButton } from "../ThemeToggleButton";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
 
  const isLoggedIn = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const isCoach = isLoggedIn && user?.type === "coach";
  const isAdmin = isLoggedIn && user?.type === "admin";
 
  const handleToggle = () => setIsOpen(!isOpen);
 
  const handleLogin = () => {
    if (!isLoggedIn) {
      navigate("/auth/sign-in");
    }
  };
 
  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
    navigate("/");
  };
 
  const navItems = isLoggedIn
    ? [
        { name: "Home", to: "/" },
        { name: "Workouts", to: "/workouts" },
        { name: "Coaches", to: "/coaches" },
      ]
    : [
        { name: "Home", to: "/" },
        { name: "Coaches", to: "/coaches" },
      ];
 
  // 🔹 Coach-specific layout
  if (isCoach) {
    return (
      <nav className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between px-2 md:px-4">
          <div className="flex items-center space-x-14 pl-1">
            <div className="flex items-center space-x-4">
              <img src={Logo} alt="Logo" className="h-8 w-auto" />
              <span className="font-semibold text-lg dark:text-white">EnergyX</span>
            </div>
            <NavLink
              to="/coachpage"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive
                    ? "text-black dark:text-white border-b-2 border-lime-400 pb-1"
                    : "text-gray-600 dark:text-gray-300"
                }`
              }
            >
              Workouts
            </NavLink>
          </div>
 
          <div className="flex items-center space-x-4">
            <Bell size={22} className="text-gray-700 dark:text-gray-300 cursor-pointer" />
            <UserCircle
              size={22}
              className="text-gray-700 dark:text-gray-300 cursor-pointer"
              onClick={() => setShowDropdown((prev) => !prev)}
            />
            {showDropdown && (
              <ProfileDropdown
                onLogout={handleLogout}
                onClose={() => setShowDropdown(false)}
              />
            )}
          </div>
        </div>
      </nav>
    );
  }
 
  // 🔹 Admin-specific layout
  if (isAdmin) {
    return (
      <nav className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between px-2 md:px-4">
          <div className="flex items-center space-x-14 pl-1">
            <div className="flex items-center space-x-4">
              <img src={Logo} alt="Logo" className="h-8 w-auto" />
              <span className="font-semibold text-lg dark:text-white">EnergyX</span>
            </div>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive
                    ? "text-black dark:text-white border-b-2 border-lime-400 pb-1"
                    : "text-gray-600 dark:text-gray-300"
                }`
              }
            >
              Home
            </NavLink>
 
            <NavLink
              to="/admin/reports"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive
                    ? "text-black dark:text-white border-b-2 border-lime-400 pb-1"
                    : "text-gray-600 dark:text-gray-300"
                }`
              }
            >
              Reports
            </NavLink>
          </div>
 
          <div className="flex items-center space-x-4">
            <Bell size={22} className="text-gray-700 dark:text-gray-300 cursor-pointer" />
            <UserCircle
              size={22}
              className="text-gray-700 dark:text-gray-300 cursor-pointer"
              onClick={() => setShowDropdown((prev) => !prev)}
            />
            {showDropdown && (
              <ProfileDropdown
                onLogout={handleLogout}
                onClose={() => setShowDropdown(false)}
              />
            )}
          </div>
        </div>
      </nav>
    );
  }
  
  // Default layout (client)
  return (
    <nav className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-14 pl-1">
          <div className="flex items-center space-x-2">
            <img src={Logo} alt="Logo" className="h-8 w-auto" />
            <span className="font-semibold text-lg dark:text-white">EnergyX</span>
          </div>
 
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `px-2 ${
                    isActive
                      ? "border-b-2 border-lime-500 text-black dark:text-white"
                      : "text-gray-500 dark:text-gray-300"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
 
        {/* Right Section */}
        <div className="flex items-center space-x-3 relative">
          {isLoggedIn ? (
            <div className="hidden md:flex items-center space-x-3 relative">
              {/* Add ThemeToggleButton here */}
              <ThemeToggleButton />
              <Bell size={25} className="cursor-pointer text-gray-500 dark:text-gray-300" />
              <div className="relative">
                <UserCircle
                  size={25}
                  className="cursor-pointer text-gray-500 dark:text-gray-300"
                  onClick={() => setShowDropdown((prev) => !prev)}
                />
                {showDropdown && (
                  <ProfileDropdown
                    onLogout={handleLogout}
                    onClose={() => setShowDropdown(false)}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              {/* Add ThemeToggleButton here */}
              <ThemeToggleButton />
              <button
                className="border px-4 py-1 rounded cursor-pointer dark:border-gray-600 dark:text-white"
                onClick={handleLogin}
              >
                Log In
              </button>
            </div>
          )}
 
          {/* Mobile View */}
          <div className="flex md:hidden items-center space-x-3">
            {/* Add ThemeToggleButton here */}
            <ThemeToggleButton />
            {isLoggedIn && (
              <Bell size={25} className="text-gray-500 dark:text-gray-300 cursor-pointer" />
            )}
            <button onClick={handleToggle}>
              {isOpen ? (
                <X size={25} className="text-gray-500 dark:text-gray-300 cursor-pointer" />
              ) : (
                <Menu size={25} className="text-gray-500 dark:text-gray-300 cursor-pointer" />
              )}
            </button>
          </div>
        </div>
      </div>
 
      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-4">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-2 py-1 rounded ${
                    isActive 
                      ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300" 
                      : "text-gray-600 dark:text-gray-300"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            {isLoggedIn && (
              <NavLink
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-2 py-1 rounded ${
                    isActive 
                      ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300" 
                      : "text-gray-600 dark:text-gray-300"
                  }`
                }
              >
                Profile
              </NavLink>
            )}
            {!isLoggedIn && (
              <button
                className="mt-2 border px-4 py-1 rounded self-start cursor-pointer dark:border-gray-600 dark:text-white"
                onClick={handleLogin}
              >
                Log In
              </button>
            )}

            {isLoggedIn && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block px-2 py-1 rounded text-gray-600 dark:text-gray-300 text-left w-full"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
 
export default Navbar;