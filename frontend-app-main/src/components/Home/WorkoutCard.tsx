 import React, { useState } from "react";
import { CalendarFold, Clock4, Dumbbell } from "lucide-react";
import LoginModal from "../common/LoginModal";
import BookingConfirmationModal from "../common/BookingConfirmationModal";
import { useNavigate } from "react-router-dom";
import Toaster from "../common/Toaster";
import { useAppSelector } from "../../hooks/redux";
import { Link } from "react-router-dom";

// Define the interface for the API workout data
interface AvailableWorkout {
  coachId: string;
  coachName: string;
  coachTitle: string;
  coachProfileUrl: string;
  rating: number;
  type: string;
  date: string;
  selectedTime: string;
  availableSlots: string[];
}

interface WorkoutCardProps {
  workout: AvailableWorkout;
  selectedDate: Date;
  selectedTime: string;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, selectedDate, selectedTime }) => {
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isLoggedIn = useAppSelector((state) => state.auth.isAuthenticated);
  const clientId = useAppSelector((state) => state.auth.user?.id);

  // Function to convert from 24-hour to 12-hour format for display
  const convertTo12HourFormat = (time24h: string): string => {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleBookClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  // Convert the API workout data to the format expected by BookingConfirmationModal
  const trainerData = {
    id: workout.coachId,
    name: workout.coachName,
    image: workout.coachProfileUrl || "/images/default-coach.jpg",
    rating: workout.rating,
    title: workout.coachTitle,
    description: `${workout.coachName} is a professional ${workout.type} trainer ready to help you achieve your fitness goals.`,
    availableTimes: workout.availableSlots.map(convertTo12HourFormat),
    booking: {
      type: workout.type,
      time: selectedTime,
      date: selectedDate.toISOString(),
    }
  };
  
  console.log(trainerData.booking.time, trainerData.booking.date);
  
  // Updated to receive the toast message from BookingConfirmationModal
  const handleBookingConfirm = (message: string) => {
    setShowConfirmModal(false);
    setToast({ type: "success", message: message });

    // Auto-dismiss toast after 3 seconds
    setTimeout(() => setToast(null), 3000);
  };

  type WorkoutType = "Yoga" | "Rock Climbing" | "Strength" | "Fitness";
  const description: Record<WorkoutType, string> = {
    "Yoga": "A Yoga Expert dedicated to crafting personalized workout plans that align with your goals.",
    "Rock Climbing": "Scale new challenges with our Climbing Coach. Get instruction to improve climbing skills, and build confidence on the wall.",
    "Strength": "Achieve peak performance with our Strength Coach, a specialist in building muscle and increasing power.",
    "Fitness": "Transform your fitness with our Functional Fitness Trainer, who focuses on exercises that mimic real-life movements."
  };

  return (
    <>
      <article className="border border-gray-100 rounded-2xl p-4 shadow-md flex flex-col gap-4 w-full">
        {/* Top section */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
          {/* Left side - trainer info */}
          <div className="flex items-start gap-4">
            <img
              src={workout.coachProfileUrl || "/images/default-coach.jpg"}
              alt={workout.coachName}
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/default-coach.jpg"; // Fallback image
              }}
            />
            <div>
              <h2 className="text-lg font-semibold">{workout.coachName}</h2>
              <p className="text-sm text-gray-500">{workout.coachTitle}</p>
              <div className="mt-1">
                <span className="text-sm text-yellow-600 font-medium">
                  {workout.rating}⭐
                </span>
              </div>
            </div>
          </div>

          {/* Right side - booking details */}
          <div className="relative border border-lime-400 rounded-lg p-4 flex-1 min-w-[150px]">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-gray-700 text-sm font-semibold">
              Booking details
            </h3>
            <ul className="text-sm text-gray-600 mt-2 space-y-2">
              <li className="flex items-center gap-2">
                <Dumbbell size={16} />
                <strong className="text-gray-700">Type:</strong> {workout.type}
              </li>
              <li className="flex items-center gap-2">
                <Clock4 size={16} />
                <strong className="text-gray-700">Time:</strong> 1 hr
              </li>
              <li className="flex items-center gap-2">
                <CalendarFold size={16} />
                <strong className="text-gray-700">Date:</strong> {`${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${convertTo12HourFormat(workout.selectedTime)}`}
              </li>
            </ul>
          </div>
        </div>

        <p className="text-sm text-gray-600">{description[workout.type as WorkoutType]}</p>

        {/* Available times */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700">
            Also available for this date:
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {workout.availableSlots.slice(0, 5).map((time) => {
              // Parse the start time
              const [hours, minutes] = time.split(':').map(Number);

              // Calculate end time (1 hour later)
              const endHour = (hours + 1) % 24;

              // Determine if both start and end times are in AM or PM
              const startAmPm = hours < 12 ? 'AM' : 'PM';
              const endAmPm = endHour < 12 ? 'AM' : 'PM';

              // Convert to 12-hour format
              const startHour12 = hours % 12 || 12;
              const endHour12 = endHour % 12 || 12;

              // Format the time range
              const timeRange = startAmPm === endAmPm
                ? `${startHour12}:${minutes.toString().padStart(2, '0')} - ${endHour12}:${minutes.toString().padStart(2, '0')} ${startAmPm}`
                : `${startHour12}:${minutes.toString().padStart(2, '0')} ${startAmPm} - ${endHour12}:${minutes.toString().padStart(2, '0')} ${endAmPm}`;

              return (
                <span
                  key={time}
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 bg-lime-100"
                >
                  {timeRange}
                </span>
              );
            })}
            {workout.availableSlots.length > 5 && (
              <span className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 bg-lime-100">
                +{workout.availableSlots.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex flex-row gap-2">
          <Link to={`/coach-profile/${workout.coachId}`} className="w-1/2 px-8 py-3 border flex justify-center border-gray-500 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer">
            Coach Profile
          </Link>
          <button
            className="w-1/2 px-8 py-3 bg-[#9EF300] text-black text-base font-semibold rounded-lg hover:bg-lime-500 transition cursor-pointer"
            onClick={handleBookClick}
          >
            Book Workout
          </button>
        </div>
      </article>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          navigate("/auth/sign-in");
        }}
      />
      <BookingConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleBookingConfirm}
        trainer={trainerData}
        clientId={clientId || ""}
      />

      {/* Toast - now only shown after booking confirmation */}
      {toast && <Toaster type={toast.type} message={toast.message} />}
    </>
  );
};

export default WorkoutCard;