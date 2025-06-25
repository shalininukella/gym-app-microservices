import { useState } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isBefore
} from "date-fns";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CalendarProps = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: (slot: string | null) => void;
};

const Calendar = ({
  selectedDate,
  setSelectedDate,
}: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleDateClick = (day: Date) => {
    if (isBefore(day, new Date()) && !isSameDay(day, new Date())) return;
    setSelectedDate(day);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return (
      <>
        <div className="flex items-center justify-between mb-2 text-gray-600 dark:text-gray-400">
          <button onClick={prevMonth} className="p-1">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-sm font-medium font-lexend">
            {format(currentMonth, "MMMM yyyy")}
          </div>
          <button onClick={nextMonth} className="p-1">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <div className="border-t border-gray-300 dark:border-gray-600 mb-2" />
        <div className="flex justify-between my-3">
          {days.map((day) => (
            <div key={day} className="w-8 text-center text-[0.7rem] text-gray-500 dark:text-gray-400 font-lexend">
              {day}
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(day, "d");
        const isPast = isBefore(day, new Date()) && !isSameDay(day, new Date());
        const isToday = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        if (isCurrentMonth) {
          days.push(
            <div
              key={day.toString()}
              className={clsx(
                "w-10 h-8 flex items-center justify-center rounded-2xl cursor-default text-sm font-lexend font-light",
                {
                  "text-[#323A3A] dark:text-gray-200": true,
                  "bg-[#F6FFE5] dark:bg-[#7a916f] border border-[#9EF300] dark:border-green-600": isToday,
                  "hover:bg-[#F6FFE5] dark:hover:bg-green-800": !isPast,
                  "cursor-not-allowed text-gray-300 dark:text-gray-600": isPast,
                }
              )}
              onClick={() => handleDateClick(cloneDay)}
            >
              {formattedDate}
            </div>
          );
        } else {
          // Add an empty placeholder for non-current month days
          days.push(<div key={day.toString()} className="w-10 h-8" />);
        }

        day = addDays(day, 1);
      }

      rows.push(
        <div className="flex gap-2 justify-between" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="flex flex-col gap-3">{rows}</div>;
  };

  return (
    <div className="rounded-lg py-3 px-5 max-w-[500px] max-h-[300px] font-[Lexend]">
      {renderHeader()}
      {renderDays()}
    </div>
  );
};

export default Calendar;