import { useState, useEffect, useRef } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isBefore } from "date-fns";
import clsx from "clsx";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

type CalendarProps = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

const Calendar = ({ selectedDate, setSelectedDate }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  const handleDateClick = (day: Date) => {
    if (isBefore(day, new Date()) && !isSameDay(day, new Date())) return;
    setSelectedDate(day);
    setShowCalendar(false);
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <>
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-lg font-[18px]">{format(currentMonth, "MMMM yyyy")}</div>
          <button onClick={nextMonth} className="p-2">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="border-t border-gray-300 mb-4" />

        <div className="flex justify-between mb-2">
          {days.map((day) => (
            <div key={day} className="w-10 text-center text-sm font-[12px] text-black">
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
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const isPast = isBefore(day, new Date()) && !isSameDay(day, new Date());
        const isToday = isSameDay(day, selectedDate);

        days.push(
          <div
            key={day.toString()}
            className={clsx(
              "w-12 h-10 flex items-center justify-center mb-1 cursor-pointer rounded-3xl font-[16px]",
              {
                "text-gray-400": !isSameMonth(day, monthStart),
                "text-black": isSameMonth(day, monthStart),
                "bg-[#F6FFE5] border border-[#9EF300]": isToday,
                "hover:bg-[#F6FFE5]": !isPast,
                "cursor-not-allowed text-gray-300": isPast,
              }
            )}
            onClick={() => handleDateClick(cloneDay)}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex flex-row gap-2" key={day.toString()}> 
          {days}
        </div>
      );
      days = [];
    }
    return <div className="flex flex-col gap-2">{rows}</div>;
  };

  return (
    <div ref={calendarRef}>
      <fieldset className="pb-2 bg-white border border-[#DADADA] rounded-lg relative">
        <legend className="mx-2 px-2 font-light text-[#4B5563]">
          Select Date
        </legend>

        <div
          onClick={() => setShowCalendar((prev) => !prev)}
          className="cursor-pointer flex justify-between items-center px-4 py-1 rounded-md text-[#323A3A] bg-white w-full"
        >
          <span>{format(selectedDate, "MMMM dd")}</span>
          <ChevronDown
            className={clsx("w-4 h-4 transition-transform", {
              "rotate-180": showCalendar,
            })}
          />
        </div>
        {showCalendar && (
          <div className="absolute mt-4 bg-white rounded-lg shadow-lg p-5 z-50">
            {renderHeader()}
            {renderDays()}
          </div>
        )}
      </fieldset>
    </div>
  );
};

export default Calendar;