import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TimeSlots from "../Calendar/TimeSlots";
import { vi } from "vitest";

describe("TimeSlots", () => {
  const mockAvailableSlots = ["10:00-11:00 AM", "11:00-12:00 PM", "12:00-1:00 PM"];
  const mockSelectedDate = new Date("2023-06-15");
  const mockSetSelectedTimeSlot = vi.fn();

  it("renders available time slots after loading", async () => {
    render(
      <TimeSlots
        availableSlots={mockAvailableSlots}
        selectedDate={mockSelectedDate}
        selectedTimeSlot={null}
        setSelectedTimeSlot={mockSetSelectedTimeSlot}
      />
    );
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await waitFor(() => {
      expect(screen.getByText("10:00-11:00 AM")).toBeInTheDocument();
      expect(screen.getByText("11:00-12:00 PM")).toBeInTheDocument();
      expect(screen.getByText("12:00-1:00 PM")).toBeInTheDocument();
    });
  });

  it("displays the selected date and number of available slots", async () => {
    render(
      <TimeSlots
        availableSlots={mockAvailableSlots}
        selectedDate={mockSelectedDate}
        selectedTimeSlot={null}
        setSelectedTimeSlot={mockSetSelectedTimeSlot}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Jun 15")).toBeInTheDocument();
      expect(screen.getByText("3 slots available")).toBeInTheDocument();
    });
  });

  it("calls setSelectedTimeSlot when a time slot is clicked", async () => {
    render(
      <TimeSlots
        availableSlots={mockAvailableSlots}
        selectedDate={mockSelectedDate}
        selectedTimeSlot={null}
        setSelectedTimeSlot={mockSetSelectedTimeSlot}
      />
    );
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await waitFor(() => {
      fireEvent.click(screen.getByText("10:00-11:00 AM"));
    });

    expect(mockSetSelectedTimeSlot).toHaveBeenCalledWith("10:00-11:00 AM");
  });
});
