 import React, { useState } from "react";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { CalendarFold, Clock4, Dumbbell, X } from "lucide-react";
import { Trainer } from "../../interfaces/Coaches/types";
import api from "../../api/axios";
import Toaster from "../common/Toaster";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void; // Updated to pass toast message
  trainer: Trainer;
  clientId: string;
}
 
// Helper to format frontend display
function formatDisplayDate(dateString: string, timeString: string) {
  const dateObj = new Date(dateString);
 
  const [hours, minutes] = timeString.split(":").map(Number);
  dateObj.setHours(hours);
  dateObj.setMinutes(minutes);
 
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
  };
  const formattedDate = dateObj.toLocaleDateString("en-US", options);
 
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
 
  return `${formattedDate}, ${formattedTime}`;
}
 
const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  trainer,
  clientId,
}) => {
  const { id, booking } = trainer;
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleBookingConfirm = async () => {
    try {
      setIsLoading(true);
      const dateObj = new Date(booking.date);
 
      const [hours, minutes] = booking.time.split(":").map(Number);
      dateObj.setHours(hours);
      dateObj.setMinutes(minutes);
      dateObj.setSeconds(0);
      dateObj.setMilliseconds(0);
 
      const formattedDate = `${dateObj.getDate().toString().padStart(2, "0")}-${(dateObj.getMonth() + 1).toString().padStart(2, "0")}-${dateObj.getFullYear()}`;
      const formattedTime = `${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}`;
      const response = await api.post(
        `/booking/dev/client/workouts`,
        {
          coachId: id,
          clientId: clientId,
          type: booking.type,
          date: formattedDate,
          time: formattedTime,
          coachFeedbackId: null,
          clientFeedbackId: null,
        }
      );

      console.log("Workout booked successfully:", response.data);
      
      // Show success toast with the message from API
      const toastMessage = response.data.toastMessage || "Workout booked successfully!";
      setToast({ type: "success", message: toastMessage });
      
      // Close modal and pass toast message after a delay
      setTimeout(() => {
        onClose();
        onConfirm(toastMessage);
      }, 1500);
      
    } catch (error: any) {
      console.error("Error booking workout:", error);
      
      // Show error toast with message from API if available
      const errorMessage = error.response?.data?.toastMessage || 
                          error.response?.data?.error || 
                          "Failed to book workout. Please try again.";
      
      setToast({ type: "error", message: errorMessage });
      
      // Auto-dismiss error toast after 3 seconds
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-3">
          <DialogPanel className="bg-white p-5 rounded-lg shadow-xl max-w-[600px]">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Confirm your booking
              </DialogTitle>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
                disabled={isLoading}
              >
                <X />
              </button>
            </div>

            <Description className="text-sm text-gray-500 mb-6">
              Please double-check your workout details.
            </Description>

            <div className="flex justify-between items-start mb-6 gap-7">
              {/* Trainer Info */}
              <div className="flex items-center gap-4">
                <img
                  src={trainer.image}
                  alt={trainer.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-md font-semibold">{trainer.name}</h2>
                  <p className="text-sm text-gray-500">{trainer.title}</p>
                  <p className="text-sm text-gray-800 font-medium">
                    {trainer.rating}{" "}
                    <span className="text-yellow-500 text-base">★</span>
                  </p>
                </div>
              </div>

              {/* Booking Info */}
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center gap-2">
                  <Dumbbell size={16} />
                  <span>
                    <strong>Type:</strong> {trainer.booking.type}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock4 size={16} />
                  <span>
                    <strong>Time:</strong> 1hr
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CalendarFold size={16} />
                  <span>
                    <strong>Date:</strong> {formatDisplayDate(trainer.booking.date, trainer.booking.time)}
                  </span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleBookingConfirm}
              disabled={isLoading}
              className={`w-full py-2 ${isLoading ? 'bg-gray-300' : 'bg-[#9EF300] hover:bg-lime-400'} text-black font-medium rounded-md transition cursor-pointer`}
            >
              {isLoading ? "Booking..." : "Confirm"}
            </button>
          </DialogPanel>
        </div>
      </Dialog>
      
      {/* Toast inside the modal */}
      {toast && <Toaster type={toast.type} message={toast.message} />}
    </>
  );
};

export default BookingConfirmationModal;