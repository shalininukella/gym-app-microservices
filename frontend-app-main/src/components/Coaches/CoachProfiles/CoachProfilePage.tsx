import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CoachProfileCard from "./CoachProfileCard";
import CalendarPage from "../Calendar/CalendarPage";
import FeedbackList from "../Feedbacks/FeedbackSection";
import { Coach } from "../../../interfaces/Coaches/Coaches";
import UpcomingWorkouts from "./UpcomingWorkouts";
import { useAppSelector } from "../../../hooks/redux";
import api from '../../../api/axios';

const CoachProfilePage = () => {
  const { coachId } = useParams();

  const [coach, setCoach] = useState<Coach | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const isLoggedIn = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/gym/dev/coaches/${coachId}`);
        setCoach(response.data);
      } catch (error) {
        console.error("Error fetching coach data:", error);
      }
    };

    if (coachId) {
      fetchData();
    }
  }, [coachId]);

  if (!coachId) return <div className="text-gray-600 dark:text-gray-300">Invalid Coach Id</div>;

  return (
    <div className="flex flex-col p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <span className="font-lexend text-xs text-gray-500 dark:text-gray-400 my-3 ml-4">
        Coaches &gt; <span className="text-black dark:text-gray-100 text-xs">{coach?.firstName} {coach?.lastName}</span>
      </span>

      <div className="flex flex-col sm:flex-row gap-4">
        <CoachProfileCard
          coachId={coachId}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
        />

        <div className="flex flex-col gap-4 w-full">
          <CalendarPage
            coachId={coachId}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTimeSlot={selectedTimeSlot}
            setSelectedTimeSlot={setSelectedTimeSlot}
          />
          {isLoggedIn && <UpcomingWorkouts coachId={coachId} />}
          <FeedbackList coachId={coachId} />
        </div>
      </div>
    </div>
  );
};

export default CoachProfilePage;