import { format } from "date-fns";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type Props = {
  availableSlots: string[];
  selectedDate: Date;
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: (slot: string | null) => void;
};

const TimeSlots = ({ availableSlots, selectedDate, selectedTimeSlot, setSelectedTimeSlot }: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating an asynchronous operation (e.g., fetching data)
    setSelectedTimeSlot(null); // Reset selected time slot when date changes
    const fetchData = async () => {
      setIsLoading(true);
      // Simulating a delay of 1 second
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsLoading(false);
    };

    fetchData();
  }, [selectedDate]);

  const handleSlotClick = (time: string) => {
    setSelectedTimeSlot(time);
  };

  return (
    <div className="py-4 rounded-lg font-[Lexend] text-gray-500 dark:text-gray-200 w-full max-h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium">{format(selectedDate, 'MMM d')}</span>
        <span className="text-xs">{availableSlots.length} slots available</span>
      </div>

      <div className="border-t border-gray-300 dark:border-gray-600 mb-3" />

      <div className="overflow-y-auto max-h-[250px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} height={40} borderRadius={8} />
            ))}
          </div>
        ) : availableSlots.length > 0 ? (
          <div className="flex flex-col gap-2">
            {availableSlots.map((time) => (
              <div
                key={time}
                onClick={() => handleSlotClick(time)}
                className={`p-3 w-full rounded-lg text-center text-sm cursor-default border 
                  ${
                    selectedTimeSlot === time
                      ? 'border-[#9EF300] dark:border-[#9EF300] dark:bg-[#7a916f]'
                      : 'border-transparent hover:border-[#C8F169] dark:hover:border-[#C8F169] dark:bg-gray-700 dark:hover:bg-gray-600'
                  } bg-[#F6FFE5]`}
              >
                {time}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-slots text-center text-gray-500 dark:text-gray-400 text-sm mt-2">
            No available slots for this date
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlots;