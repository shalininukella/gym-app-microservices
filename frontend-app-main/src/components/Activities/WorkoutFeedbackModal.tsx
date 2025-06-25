 import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Description,
} from "@headlessui/react";
import { Dumbbell, Clock4, CalendarFold, X, Star } from "lucide-react";
import api from "../../api/axios";
import { useAppSelector } from "../../hooks/redux";
import { RootState } from "../../store";
import Toaster from "../common/Toaster";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Coach {
  _id: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  rating: number;
  title: string;
}
 
interface WorkoutFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void; // Updated to pass toast message
  coachId: string;
  type: string;
  time: string;
  date: string;
  workoutId: string;
  onStatusUpdate: (workoutId: string, newStatus: "Finished" | "Waiting for feedback") => void;
}

const WorkoutFeedbackModal: React.FC<WorkoutFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onStatusUpdate,
  coachId,
  workoutId,
  type,
  time,
  date,
}) => {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toaster, setToaster] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const clientId = useAppSelector((state: RootState) => state.auth.user?.id);
 
  useEffect(() => {
    const fetchCoach = async () => {
      if (!coachId) return;
      setLoading(true);
      try {
        const res = await api.get(`/gym/dev/coaches/${coachId}`);
        setCoach(res.data);
      } catch (err) {
        console.error("Failed to fetch coach data", err);
      } finally {
        setLoading(false);
      }
    };
 
    if (isOpen) fetchCoach();
  }, [coachId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(null);
      setComment("");
      setToaster(null);
    }
  }, [isOpen]);

  // Auto-dismiss toaster
  useEffect(() => {
    if (toaster) {
      const timer = setTimeout(() => setToaster(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toaster]);

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(null)}
        className="focus:outline-none cursor-pointer"
      >
        <Star
          size={20}
          className={`transition-colors ${
            star <= (hoverRating ?? rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-500"
          }`}
          fill={star <= (hoverRating ?? rating) ? "#facc15" : "none"}
        />
      </button>
    ));
  };

  const handleSubmit = async () => {
    // Client-side validation
    if (rating < 1) {
      setToaster({
        type: "error",
        message: "Please select a rating before submitting"
      });
      return;
    }
    
    if (!comment.trim()) {
      setToaster({
        type: "error",
        message: "Please add a comment before submitting"
      });
      return;
    }
    
    if (!clientId || !coachId || !workoutId) {
      setToaster({
        type: "error",
        message: "Missing required information. Please refresh and try again."
      });
      return;
    }
    
    // Log the data being sent for debugging
    console.log("Submitting feedback with:", {
      coachId,
      clientId,
      workoutId,
      rating,
      comment
    });
    
    setIsSubmitting(true);
    try {
      // Using the correct endpoint
      const feedbackRes = await api.post('/booking/dev/client/feedbacks', {
        coachId,
        clientId,
        workoutId,
        rating,
        comment,
      });
      
      console.log("Feedback response:", feedbackRes.data);
      
      // Update local state to reflect the change
      onStatusUpdate(workoutId, "Finished");
      
      // Get toast message from API response
      const successMessage = feedbackRes.data?.toastMessage || "Feedback submitted successfully";
      
      // Show success toast in modal
      setToaster({
        type: "success",
        message: successMessage,
      });

      // Close modal and pass message to parent after a delay
      setTimeout(() => {
        onClose();
        onSubmit(successMessage); // Pass the message to parent component
      }, 1500);

    } catch (error: any) {
      console.error("Feedback submission error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Use the toastMessage from the API if available
      const errorMessage = error?.response?.data?.toastMessage ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit feedback. Please try again.";
      
      setToaster({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-xl transition-colors">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                Workout feedback
              </DialogTitle>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                <X />
              </button>
            </div>

            <Description className="text-sm text-gray-600 dark:text-gray-400 mb-10">
              Please rate your experience below
            </Description>

            {loading ? (
              <div className="flex flex-col md:flex-row justify-between items-start sm:items-center mb-6 gap-10">
                <div className="flex items-center gap-4 w-full md:w-1/2">
                  <Skeleton circle width={64} height={64} enableAnimation={true} />
                  <div className="flex flex-col gap-2">
                    <Skeleton width={120} height={16} enableAnimation={true} />
                    <Skeleton width={100} height={12} enableAnimation={true} />
                    <Skeleton width={60} height={12} enableAnimation={true} />
                  </div>
                </div>

                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 w-full md:w-1/2">
                  <li className="flex items-center gap-2">
                    <Skeleton width={150} height={12} enableAnimation={true} />
                  </li>
                  <li className="flex items-center gap-2">
                    <Skeleton width={100} height={12} enableAnimation={true} />
                  </li>
                  <li className="flex items-center gap-2">
                    <Skeleton width={140} height={12} enableAnimation={true} />
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start sm:items-center mb-6 gap-10">
                  <div className="flex items-center gap-4 w-full md:w-1/2">
                    <img
                      src={coach?.profilePic}
                      alt={coach?.firstName}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/default-coach.jpg"; // Fallback image
                      }}
                    />
                    <div>
                      <h2 className="text-md font-semibold dark:text-white">
                        {coach?.firstName} {coach?.lastName}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{coach?.title}</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                        {coach?.rating} <span className="text-yellow-500 text-base">★</span>
                      </p>
                    </div>
                  </div>

                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 w-full md:w-1/2">
                    <li className="flex items-center gap-2">
                      <Dumbbell size={16} className="dark:text-gray-400" />
                      <span><strong className="dark:text-gray-200">Type:</strong> {type}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock4 size={16} className="dark:text-gray-400" />
                      <span><strong className="dark:text-gray-200">Time:</strong> {time}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CalendarFold size={16} className="dark:text-gray-400" />
                      <span><strong className="dark:text-gray-200">Date:</strong> {date}</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col items-center mb-6">
                  <div className="flex gap-2">{renderStars()}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rating}/5 stars</p>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your comments"
                  className="w-full border dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 resize-none mb-6 focus:outline-none focus:ring-2 focus:ring-lime-400 dark:focus:ring-lime-500 transition-colors"
                  rows={3}
                />

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full p-4 ${
                    isSubmitting 
                      ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed" 
                      : "bg-[#9EF300] hover:bg-lime-400 dark:hover:bg-lime-500 cursor-pointer"
                  } text-black font-semibold text-sm rounded-md transition-colors`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </>
            )}

            {/* Toast inside the modal */}
            {toaster && (
              <div className="mt-4">
                <Toaster
                  type={toaster.type}
                  message={toaster.message}
                />
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};
 
export default WorkoutFeedbackModal;