 import React from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from "lucide-react";

interface CancelWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelConfirm: () => void;
}

const CancelWorkoutModal: React.FC<CancelWorkoutModalProps> = ({
  isOpen,
  onClose,
  onCancelConfirm,
}) => {
  const handleCancel = () => {
    onCancelConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />

      {/* Modal panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-[400px] transition-colors">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Cancel Workout
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl cursor-pointer transition-colors"
            >
              <X />
            </button>
          </div>

          <Description className="mt-4 text-gray-700 dark:text-gray-300 text-sm">
            You're about to mark this workout as canceled. Are you sure you want
            to cancel this session? Any progress or data from this workout will
            not be saved.
          </Description>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              Resume Workout
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded bg-[#8bc02a] text-white hover:bg-green-600 dark:hover:bg-green-700 cursor-pointer transition-colors"
            >
              Cancel Workout
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default CancelWorkoutModal;