import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useAppSelector } from "../../../hooks/redux";
import { format, parse } from "date-fns";
import api from '../../../api/axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface ApiResponse {
  type: string;
  upcomingWorkouts: string[]; // e.g. ["May 15, 06:00 PM"]
}

const UpcomingWorkouts: React.FC<{ coachId: string }> = ({ coachId }) => {
  const clientId = useAppSelector((state) => state.auth.user?.id);
  const [workoutType, setWorkoutType] = useState<string>("");
  const [workouts, setWorkouts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!coachId || !clientId) return;
      setIsLoading(true);
      try {
        const response = await api.get<ApiResponse>(
          `/gym/dev/coaches/${coachId}/upcoming-workouts/${clientId}`
        );
        setWorkoutType(response.data.type);
        console.log(response.data);
        setWorkouts(response.data.upcomingWorkouts);
      } catch (error) {
        console.error("Error fetching upcoming workouts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [coachId, clientId]);

  return (
    <div className="text-gray-600 dark:text-white mt-4">
      <span className="font-lexend text-xs text-gray-500 dark:text-white">UPCOMING WORKOUTS</span>

      {isLoading ? (
        <div className="mt-3">
          <Skeleton height={60} />
        </div>
      ) : (workouts ?? []).length === 0 ? (
        <div className="text-sm text-gray-400 dark:text-white mt-2">No upcoming workouts found.</div>
      ) : (
        (workouts ?? []).map((datetime, index) => {
          const parsedDate = parse(datetime, "MMM d, hh:mm a", new Date());
          return (
            <div
              key={index}
              className="flex justify-between bg-sky-50 rounded-sm border-l-5 border-l-sky-400 px-6 py-4 mt-3"
            >
              <div className="flex gap-4 items-center">
                <span className="text-sm font-semibold text-gray-800">{workoutType}</span>
                <span className="text-xs text-gray-500">{format(parsedDate, "MMMM d, h:mm a")}</span>
              </div>
              <div className="flex gap-2 items-center">
                <Clock size={15} color="currentColor" className="text-gray-500" />
                <span className="text-xs text-gray-500">1 hour</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default UpcomingWorkouts;