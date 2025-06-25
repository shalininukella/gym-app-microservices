import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Calendar from './Calendar';
import TimeSlots from './TimeSlots';
import { format } from 'date-fns';
import api from '../../../api/axios';


type Props = {
  coachId: string;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: (slot: string | null) => void;
};

const CalendarPage: React.FC<Props> = ({
  coachId,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
}) => {
  const params = useParams();
  const finalCoachId = coachId || params.coachId;
  const [daySlots, setDaySlots] = useState<string[]>([]);

  useEffect(() => {
    const fetchSlotsForDate = async () => {
      if (!finalCoachId || !selectedDate) return;
      
      const formattedDate = format(selectedDate, 'dd-MM-yyyy');
      console.log(finalCoachId, formattedDate);
      try {
        const response = await api.get(
          `/gym/dev/coaches/${finalCoachId}/available-slots/${formattedDate}`
        );
        const data = response.data.availableSlots;
        console.log(response.data.availableSlots);
        setDaySlots(data);
        console.log(data.availableSlots, daySlots);
      } catch (error) {
        console.error("Error fetching slot data:", error);
        setDaySlots([]);
      }
    };

    fetchSlotsForDate();
  }, [finalCoachId, selectedDate]);

  if (!finalCoachId) {
    return <div className="p-4 text-red-500">Coach ID not found</div>;
  }

  return (
    <>
      <span className="font-lexend text-gray-600 text-xs dark:text-white">SCHEDULE</span>
      <div className="flex flex-col md:flex-row gap-4 m-2">
        <Calendar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTimeSlot={selectedTimeSlot}
          setSelectedTimeSlot={setSelectedTimeSlot}
        />
        <TimeSlots
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          setSelectedTimeSlot={setSelectedTimeSlot}
          availableSlots={daySlots}
        />
      </div>
    </>
  );
};

export default CalendarPage;
