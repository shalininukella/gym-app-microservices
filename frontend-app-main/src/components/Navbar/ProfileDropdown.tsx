 // src/components/ProfileDropdown.tsx
import React, { useEffect, useRef } from "react";
import { useAppSelector } from "../../hooks/redux";
import { Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileDropdownProps {
  onLogout: () => void;
  onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  onLogout,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleEditProfile = () => {
    navigate("/edit-profile"); 
    onClose(); 
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-10 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg border dark:border-gray-700 z-50 p-4"
    >
      {/* User Info */}
      <div className="mb-3">
        <p className="font-semibold text-gray-900 dark:text-white">
          {user?.firstName} {user?.lastName} ({user?.type ? user.type.charAt(0).toUpperCase() + user.type.slice(1) : ""})
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
      </div>

      <hr className="my-3 border-gray-200 dark:border-gray-700" />

      {/* My Account */}
      <div
        onClick={handleEditProfile}
        className="flex items-start gap-2 mb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
      >
        <Settings2 size={18} className="mt-0.5 text-gray-600 dark:text-gray-400" />
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">My Account</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Edit account profile</p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full border border-gray-300 dark:border-gray-600 py-1.5 rounded-md text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
      >
        Log Out
      </button>
    </div>
  );
};

export default ProfileDropdown;