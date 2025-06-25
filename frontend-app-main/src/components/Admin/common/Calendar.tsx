import { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  isWithinInterval,
} from "date-fns";
import clsx from "clsx";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
 
type CalendarProps = {
  startDate: Date;
  endDate: Date | null;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date | null) => void;
};
 
const Calendar = ({ startDate, endDate, setStartDate, setEndDate }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSelectingEndDate, setIsSelectingEndDate] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
        setIsSelectingEndDate(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);
  const handleDateClick = (day: Date) => {
    if (isAfter(day, new Date())) return;
 
    if (!isSelectingEndDate) {
      // First click - set start date
      setStartDate(day);
      setEndDate(null);
      setIsSelectingEndDate(true);
    } else {
      // Second click - set end date
      if (isBefore(day, startDate)) {
        // If selected end date is before start date, swap them
        setEndDate(startDate);
        setStartDate(day);
      } else {
        setEndDate(day);
      }
      setIsSelectingEndDate(false);
      setTimeout(() => setShowCalendar(false), 200);
    }
  };
 
  const nextMonth = () => {
    const nextMonthDate = addMonths(currentMonth, 1);
    if (isAfter(nextMonthDate, new Date())) return;
    setCurrentMonth(nextMonthDate);
  };
 
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
 
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
    const startDateOfCalendar = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDateOfCalendar = endOfWeek(monthEnd, { weekStartsOn: 0 });
 
    const rows = [];
    let days = [];
    let day = startDateOfCalendar;
 
    while (day <= endDateOfCalendar) {
      for (let i = 0; i < 7; i++) {
        const isFuture = isAfter(day, new Date());
        const isStart = startDate && isSameDay(day, startDate);
        const isEnd = endDate && isSameDay(day, endDate);
        const isInRange =
          startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate });
 
        const clonedDay = new Date(day);
 
        days.push(
          <div
            key={format(clonedDay, "yyyy-MM-dd")}
            className={clsx(
              "w-12 h-10 flex items-center justify-center mb-1 cursor-pointer rounded-3xl font-[16px]",
              {
                "text-gray-400": !isSameMonth(clonedDay, monthStart),
                "text-black": isSameMonth(clonedDay, monthStart),
                "bg-[#E5F9FF] text-black": (isInRange && !isStart && !isEnd) || isStart || isEnd,
                "hover:bg-[#d9f3ff]": !isFuture && !isStart && !isEnd,
                "cursor-not-allowed text-gray-300": isFuture,
                "rounded-r-full": !isStart && isEnd,
                "rounded-l-full": !isEnd && isStart,
                "rounded-full": isStart && isEnd,
                "rounded-none": isInRange && !isStart && !isEnd,
                "border-r border-[#32ADE6]": !isStart && isEnd,
                "border-l border-[#32ADE6]": !isEnd && isStart,
                "border-t border-[#32ADE6]": isInRange || isStart || isEnd,
                "border-b border-[#32ADE6]": isInRange || isStart || isEnd,
              }
            )}
            onClick={() => handleDateClick(clonedDay)}
          >
            {format(clonedDay, "d")}
          </div>
        );
 
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex flex-row" key={format(day, "yyyy-MM-dd") + "-row"}>
          {days}
        </div>
      );
      days = [];
    }
 
    return <div className="flex flex-col gap-2">{rows}</div>;
  };
 
  const formatSelectedRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "dd MMM yyyy")} - ${format(endDate, "dd MMM yyyy")}`;
    }
    return `${format(startDate, "dd MMM yyyy")}`;
  };
 
  // Reset selection state when calendar is opened
  const handleCalendarToggle = () => {
    setShowCalendar(prev => !prev);
    if (!showCalendar) {
      setIsSelectingEndDate(false);
    }
  };
 
  return (
    <fieldset className="pb-2 bg-white border border-[#DADADA] rounded-lg relative">
      <legend className="mx-2 px-2 font-light text-[#4B5563]">Period</legend>
 
      <div
        onClick={handleCalendarToggle}
        className="cursor-pointer flex justify-between items-center px-4 py-1 rounded-md text-[#323A3A] bg-white w-full"
      >
        <span>{formatSelectedRange()}</span>
        <ChevronDown
          className={clsx("w-4 h-4 transition-transform", {
            "rotate-180": showCalendar,
          })}
        />
      </div>
 
      {showCalendar && (
        <div ref={calendarRef} className="absolute mt-4 bg-white rounded-lg shadow-lg p-5 z-10">
          {renderHeader()}
          {renderDays()}
        </div>
      )}
    </fieldset>
  );
};
export default Calendar;