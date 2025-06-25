 // CoachDisplayWorkouts.tsx
import { useEffect, useState } from "react";
import header from "../../assets/Workout-header.svg";
import { CalendarCheck } from "lucide-react";
import CancelWorkoutModal from "../Activities/CancelWorkoutModal";
import { useAppSelector } from "../../hooks/redux";
import { RootState } from "../../store";
import WorkoutFeedbackModal from "./CoachWorkoutFeedbackModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import api from "../../api/axios";
import Toaster from "../common/Toaster";
 import NotAvailable from "../common/NotAvailable";
interface Workout {
  _id: string;
  coachId: string;
  clientId: string;
  type: string;
  date: string;
  time: string;
  coachStatus: "Scheduled" | "Finished" | "Cancelled" | "Waiting for feedback";
}
 
const formatWorkoutDateTime = (date: string, time: string): string => {
  const [day, month, year] = date.split("-");
  const [hour, minute] = time.split(":");
 
  const dateObj = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );
 
  const datePart = dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
 
  const timePart = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
 
  return `${datePart}, ${timePart}`;
};
 
const workoutDescriptions: Record<string, string> = {
  Yoga:
    "Enhance your flexibility and balance with this calming yoga session. Flow through a series of poses designed to stretch and strengthen your entire body while promoting relaxation.",
  Fitness:
    "Experience the ultimate workout with Ultimate Fitness Fusion, a high-energy class that combines strength training and cardio.",
  "Rock Climbing":
    "Reach new heights with Rock Climbing Challenge. This thrilling class focuses on improving your climbing skills, strength, and endurance.",
  Cardio:
    "Boost your heart health and burn calories with this high-intensity cardio session. Designed to get your heart pumping and your energy soaring.",
  "Strength Training":
    "Build lean muscle and increase overall strength in this focused strength training workout. Perfect for improving endurance, metabolism, and body composition.",
};
 
const CoachDisplayWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackWorkout, setFeedbackWorkout] = useState<Workout | null>(null);
  const [toaster, setToaster] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const userId = useAppSelector((state: RootState) => state.auth.user?.id);
 
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        console.log("Coach ID:", userId);
        const response = await api.get(
          `booking/dev/coaches-page/workouts/booked`,
          {
            params: { coachId: userId }, // Pass userId as a query parameter
          }
        );
        console.log("API Response:", response.data);
        // Ensure workouts is always an array, even if the API returns null/undefined
        setWorkouts(response.data.workouts || []);
      } catch (err: any) {
        console.error("Error fetching workouts:", err);
        const errorMessage = err?.response?.data?.toastMessage || 
                            err?.response?.data?.message || 
                            err.message || 
                            "Failed to fetch workouts. Please try again.";
        setToaster({ type: "error", message: errorMessage });
        setError(errorMessage);
        // Initialize with empty array on error
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };
 
    if (userId) {
      fetchWorkouts();
    } else {
      setLoading(false);
      setWorkouts([]); // Initialize with empty array when no userId
    }
  }, [userId]);
 
  useEffect(() => {
    if (toaster) {
      const timer = setTimeout(() => setToaster(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toaster]);
 
  const handleCancelClick = (workout: Workout) => {
    setSelectedWorkout(workout);
    setModalOpen(true);
  };
 
  const handleCancelConfirm = async () => {
    if (selectedWorkout) {
      try {
        const response = await api.patch(
          `booking/dev/coaches-page/workouts/${selectedWorkout._id}`
        );
        console.log("Cancel workout response:", response.data);
        
        setWorkouts(prev =>
          prev.map(w =>
            w._id === selectedWorkout._id ? { ...w, coachStatus: "Cancelled" } : w
          )
        );
        
        setToaster({ 
          type: "success", 
          message: response?.data?.toastMessage || "Workout cancelled successfully." 
        });
      } catch (err: any) {
        console.error("Error cancelling workout:", err);
        const errorMessage = err?.response?.data?.toastMessage || 
                            err?.response?.data?.message || 
                            err.message || 
                            "Failed to cancel the workout. Please try again.";
        setToaster({ type: "error", message: errorMessage });
      }
    }
    setModalOpen(false);
  };
 
  const updateWorkoutStatus = (workoutId: string, newStatus: "Finished" | "Waiting for feedback") => {
    setWorkouts((prevWorkouts) =>
      prevWorkouts.map((workout) =>
        workout._id === workoutId ? { ...workout, coachStatus: newStatus } : workout
      )
    );
  };
 
  // Add this function to receive toaster messages from the feedback modal
  const handleFeedbackToaster = (type: "success" | "error", message: string) => {
    setToaster({ type, message });
  };
 
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-lg shadow-md w-full md:max-w-2xl"
            >
              <Skeleton height={30} width={150} className="mb-2" />
              <Skeleton count={3} className="mb-2" />
              <div className="flex mt-3">
                <Skeleton width={120} height={30} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) return <p className="text-red-500">{error}</p>;
 
  return (
    <>
      {toaster && <Toaster type={toaster.type} message={toaster.message} />}
      <div className="relative">
        <img src={header} alt="Header" className="w-full h-auto object-cover max-h-[250px]" />
        <h1 className="absolute top-1/2 left-6 -translate-y-1/2 text-white text-sm md:text-xl drop-shadow-md">
          {isLoggedIn ? "My Workouts" : "Welcome"}
        </h1>
      </div>
 
      <div className="p-6 max-w-7xl mx-auto">
        {/* Check if workouts array exists and has length */}
        {!workouts || workouts.length === 0 ? (
          <div className="flex justify-center items-center h-full">
                <NotAvailable message="No workouts booked" />
              </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {workouts.map(workout => {
              const formattedDateTime = formatWorkoutDateTime(workout.date, workout.time);
 
              return (
                <div key={workout._id} className="relative p-6 bg-white rounded-lg shadow-md w-full md:max-w-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="pr-16 sm:pr-0">
                      <h2 className="text-xl font-semibold">{workout.type}</h2>
                    </div>
                    <span
                      className={`absolute sm:relative top-6 right-6 sm:top-0 sm:right-0 px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap ${
                        workout.coachStatus === "Scheduled"
                          ? "bg-blue-500 text-white"
                          : workout.coachStatus === "Finished"
                          ? "bg-yellow-500 text-black"
                          : workout.coachStatus === "Waiting for feedback"
                          ? "bg-gray-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {workout.coachStatus}
                    </span>
                  </div>
 
                  <p className="text-gray-700 mt-4">
                    {workoutDescriptions[workout.type] || ""}
                  </p>
 
                  <div className="mt-3 flex items-center text-gray-800 font-medium text-sm">
                    <CalendarCheck className="w-5 h-5 text-gray-800 mr-2" />
                    <span>{formattedDateTime}</span>
                  </div>
 
                  <div className="mt-4 flex justify-end">
                    {workout.coachStatus === "Waiting for feedback" && (
                      <button
                        className="px-4 py-2 border rounded cursor-pointer text-gray-800 bg-white shadow-sm hover:bg-gray-100"
                        onClick={() => {
                          setFeedbackWorkout(workout);
                          console.log(workout);
                          setFeedbackOpen(true);
                        }}
                      >
                        Leave Feedback
                      </button>
                    )}
                    {workout.coachStatus === "Scheduled" && (
                      <button
                        onClick={() => handleCancelClick(workout)}
                        className="px-4 py-2 border rounded text-gray-800 bg-white shadow-sm hover:bg-gray-100 cursor-pointer"
                      >
                        Cancel Workout
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
 
      <CancelWorkoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCancelConfirm={handleCancelConfirm}
      />
 
      {feedbackWorkout && (
        <WorkoutFeedbackModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          clientId={feedbackWorkout.clientId}
          workoutId={feedbackWorkout._id}
          type={feedbackWorkout.type}
          time="1hr"
          onStatusUpdate={updateWorkoutStatus}
          date={formatWorkoutDateTime(feedbackWorkout.date, feedbackWorkout.time)}
          onToasterMessage={handleFeedbackToaster}
          onSubmit={(comment) => {
            console.log("Comment:", comment);
            setFeedbackOpen(false);
          }}
        />
      )}
    </>
  );
};
 
export default CoachDisplayWorkouts;