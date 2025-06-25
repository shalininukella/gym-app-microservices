import React from "react";
import {  Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from "lucide-react";
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white p-6 rounded shadow-md w-[400px]">
        <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold text-gray-900">
            Log in to book workout
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
            >
            <X/>
            </button>
          </div>
         
          <p className="text-sm text-gray-600 mt-2">
            You must be logged in to book a workout. Please log in to access available slots and book your session.
          </p>
          <div className="flex justify-end mt-6 gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded text-sm text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={onLogin}
              className="px-4 py-2 bg-[#9EF300] text-black rounded hover:bg-lime-600 cursor-pointer"
            >
              Log In
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default LoginModal;
