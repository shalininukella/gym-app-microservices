import { useState, useEffect } from "react";
import Button1 from "../common/Button1";
import SelectInput from "../common/SelectInput";
import NotAvailable from "../common/NotAvailable";
import Calendar from "./Calendar";
import WorkoutCard from "./WorkoutCard";
import { useAppSelector } from "../../hooks/redux";
import { RootState } from "../../store";
import header from "../../assets/Workout-header.svg";
import axios from "axios";
import api from "../../api/axios";
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

const Home = () => {
  const [activity, setActivity] = useState(() => localStorage.getItem("workout_activity") || "all");
  const [time, setTime] = useState(() => localStorage.getItem("workout_time") || "08:00");
  const [coach, setCoach] = useState(() => localStorage.getItem("workout_coach") || "all");
  const [selectedDate, setSelectedDate] = useState(() => {
    const savedDate = localStorage.getItem("workout_date");
    return savedDate ? new Date(savedDate) : new Date();
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [availableWorkouts, setAvailableWorkouts] = useState<AvailableWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useAppSelector((state: RootState) => state.auth.user);
  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isAuthenticated);

  const allTimeSlots = [
    { value: "08:00", label: "08:00 AM" },
    { value: "09:00", label: "09:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "13:00", label: "01:00 PM" },
    { value: "14:00", label: "02:00 PM" },
    { value: "15:00", label: "03:00 PM" },
    { value: "16:00", label: "04:00 PM" },
    { value: "17:00", label: "05:00 PM" },
    { value: "18:00", label: "06:00 PM" },
    { value: "19:00", label: "07:00 PM" },
    { value: "20:00", label: "08:00 PM" }
  ];

  const getAvailableTimeSlots = () => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);
    
    if (selectedDay.getTime() === today.getTime()) {
      const currentHour = now.getHours();
      return allTimeSlots.filter(slot => {
        const slotHour = parseInt(slot.value.split(':')[0], 10);
        return slotHour > currentHour;
      });
    }
    
    return allTimeSlots;
  };

  useEffect(() => {
    const isToday = new Date().toDateString() === selectedDate.toDateString();
    
    if (isToday) {
      const currentHour = new Date().getHours();
      const currentTimeSlot = parseInt(time.split(':')[0], 10);
      
      if (currentTimeSlot <= currentHour) {
        const availableSlots = getAvailableTimeSlots();
        if (availableSlots.length > 0) {
          setTime(availableSlots[0].value);
        }
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem("workout_activity", activity);
    localStorage.setItem("workout_time", time);
    localStorage.setItem("workout_coach", coach);
    localStorage.setItem("workout_date", selectedDate.toISOString());
  }, [activity, time, coach, selectedDate]);

  useEffect(() => {
    const shouldSearch = localStorage.getItem("workout_hasSearched") === "true";
    if (shouldSearch) {
      fetchAvailableWorkouts();
      setHasSearched(true);
    }
  }, []);

  const handleActivityChange = (value: string) => setActivity(value);

  const handleTimeChange = (value: string) => {
    setTime(value);
  };
  
  const handleCoachChange = (value: string) => {
    setCoach(value === "All" ? "all" : value);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Format date as DD-MM-YYYY
  const formatDateForApi = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isPastTimeForToday = (timeStr: string): boolean => {
    const now = new Date();
    const today = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    today.setHours(hours, minutes, 0, 0);
    
    return today < now;
  };
  
  const fetchAvailableWorkouts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formattedDate = formatDateForApi(selectedDate);
      const response = await api.get(`/gym/dev/workouts/available?date=${formattedDate}&type=${activity}&time=${time}&coachId=${coach}`);
      setAvailableWorkouts(response.data);
      setHasSearched(true);
    } catch (err) {
      console.error("Error fetching available workouts:", err);
      
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data;
        
        if (errorData.error === "Invalid date") {
          setError("Cannot book workouts for past dates. Please select a future date.");
        } else if (errorData.error === "Invalid time") {
          setError("Cannot book workouts for times that have already passed. Please select a future time.");
        } else if (errorData.error === "No available times") {
          setError("No more available time slots for today. Please try booking for another day.");
        } else if (errorData.error === "Coach not found") {
          setError("The selected coach is not available. Please choose another coach.");
        } else {
          setError(errorData.message || errorData.error || "Failed to fetch available workouts");
        }
      } else {
        setError("An error occurred while fetching workouts. Please try again.");
      }
      
      setAvailableWorkouts([]);
      localStorage.setItem("workout_error", error || "");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindWorkout = () => {
    if (isPastDate(selectedDate)) {
      setError("Cannot book workouts for past dates. Please select a future date.");
      setAvailableWorkouts([]);
      setHasSearched(true);
      localStorage.setItem("workout_hasSearched", "true");
      localStorage.setItem("workout_error", "Cannot book workouts for past dates. Please select a future date.");
      return;
    }
    
    const isToday = new Date().toDateString() === selectedDate.toDateString();
    if (isToday && isPastTimeForToday(time)) {
      setError("Cannot book workouts for times that have already passed. Please select a future time.");
      setAvailableWorkouts([]);
      setHasSearched(true);
      localStorage.setItem("workout_hasSearched", "true");
      localStorage.setItem("workout_error", "Cannot book workouts for times that have already passed. Please select a future time.");
      return;
    }

    localStorage.setItem("workout_hasSearched", "true");
    fetchAvailableWorkouts();
  };

  // Clear search results and localStorage
  const handleClearSearch = () => {
    setHasSearched(false);
    setAvailableWorkouts([]);
    setError(null);
    localStorage.removeItem("workout_hasSearched");
    localStorage.removeItem("workout_error");
  };

  const availableTimeSlots = getAvailableTimeSlots();

  return (
    <>
      <div className="relative">
        <img
          src={header}
          alt="Header"
          className="w-full h-auto object-cover max-h-[250px]"
        />
        <h1 className="absolute top-1/2 left-6 -translate-y-1/2 text-white text-sm md:text-xl drop-shadow-md">
          {isLoggedIn
            ? `Hello, ${user?.firstName} ${user?.lastName}${user?.type === "admin" ? " (Admin)" : ""}`
            : "Welcome !"}
        </h1>
      </div>
      <div className="px-4 md:px-8 py-8">
        <div className="relative">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold pb-4">
            Achieve your <span className="relative inline-block">
              fitness goals!
              <img
                src="/logos/Line.svg"
                alt=""
                className="absolute left-0 bottom-[-0.25em] w-full"
              />
            </span>
          </h1>

          <div className="pt-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold relative">
              Find a workout and book <span className="relative inline-block">
                today.
                <img
                  src="/logos/Arrow.svg"
                  alt=""
                  className="absolute transform translate-x-1/4 translate-y-1/4"
                  style={{
                    width: "1em",
                    bottom: "-0.1em",
                    right: "-0.8em"
                  }}
                />
              </span>
            </h1>
          </div>
        </div>

        <h2 className="text-xl font-semibold my-6">BOOK A WORKOUT</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4 mb-6">
          <SelectInput
            label="Preferable Activity"
            name="activity"
            value={activity}
            onChange={handleActivityChange}
            defaultValue="all"
            options={[
              { value: "all", label: "All" },
              { value: "Yoga", label: "Yoga" },
              { value: "Rock Climbing", label: "Rock Climbing" },
              { value: "Fitness", label: "Fitness" },
              { value: "Strength", label: "Strength" },
            ]}
          />

          <div className="w-full">
            <Calendar selectedDate={selectedDate} setSelectedDate={handleDateChange} />
          </div>

          <SelectInput
            label="Time"
            name="time"
            value={time}
            onChange={handleTimeChange}
            defaultValue="08:00"
            options={availableTimeSlots}
          />

          <SelectInput
            label="Coach"
            name="coach"
            value={coach === "all" ? "All" : coach}
            onChange={handleCoachChange}
            defaultValue="All"
            options={[
              { value: "All", label: "All" },
              { value: "68219bd8a6ae6e7f0f382871", label: "Kristin Watson" },
              { value: "68219ce6a6ae6e7f0f382874", label: "Jenny Wilson" },
              { value: "68219d5da6ae6e7f0f382877", label: "Guy Hawkins" },
              { value: "6821a32ba6ae6e7f0f38287d", label: "Bessie Cooper" },
              { value: "6821a35ba6ae6e7f0f382880", label: "Wade Warren" },
              { value: "6821a3b7a6ae6e7f0f382883", label: "Jacob Jones" },
              { value: "6821a45fa6ae6e7f0f382886", label: "Cameron Williamson" },
              { value: "6821a49ca6ae6e7f0f382889", label: "Brooklyn Simmons" },
            ]}
          />
          <div className="container pt-2">
            <Button1
              text={isLoading ? "Loading..." : "Find Workout"}
              className="h-full w-full"
              onClick={handleFindWorkout}
            />
          </div>
        </div>

        {hasSearched && (
          <div className="min-h-[300px]">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold my-6">Available Workouts</h1>
              <button 
                onClick={handleClearSearch}
                className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                Clear Search
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading available workouts...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-40">
                <NotAvailable message={error} />
              </div>
            ) : availableWorkouts.length === 0 ? (
              <div className="flex justify-center items-center h-40">
                <NotAvailable message="No workouts available for the selected criteria. Try different options." />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {availableWorkouts.map((workout) => (
                  <WorkoutCard
                    key={workout.coachId}
                    workout={workout}
                    selectedDate={selectedDate}
                    selectedTime={workout.selectedTime}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;