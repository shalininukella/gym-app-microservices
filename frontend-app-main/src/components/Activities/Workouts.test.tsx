 import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { vi } from "vitest";
import Workouts from "./Workouts";
import api from "../../api/axios";
import { configureStore } from "@reduxjs/toolkit";

// Mock the dependencies
vi.mock("../../api/axios");
vi.mock("../../assets/Workout-header.svg", () => ({
  default: "header-mock"
}));
vi.mock("react-loading-skeleton", () => ({
  default: () => <div data-testid="skeleton" />,
}));

vi.mock("../common/NotAvailable", () => ({
  default: ({ message }: { message: string }) => <div data-testid="not-available">{message}</div>,
}));

vi.mock("./CancelWorkoutModal", () => ({
  default: ({ isOpen, onClose, onCancelConfirm }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onCancelConfirm: () => void 
  }) => isOpen ? (
    <div data-testid="cancel-modal">
      <p>Are you sure you want to cancel this workout?</p>
      <button onClick={onCancelConfirm}>Confirm</button>
      <button onClick={onClose}>Close</button>
    </div>
  ) : null,
}));

vi.mock("./WorkoutFeedbackModal", () => ({
  default: ({ isOpen, onClose, onSubmit, workoutId, onStatusUpdate }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: (message: string) => void;
    coachId: string;
    workoutId: string;
    type: string;
    time: string;
    date: string;
    onStatusUpdate: (workoutId: string, status: any) => void;
  }) => isOpen ? (
    <div data-testid="feedback-modal">
      <button onClick={() => {
        onStatusUpdate(workoutId, "Finished");
        onSubmit("Feedback submitted successfully");
      }}>
        Submit Feedback
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  ) : null,
}));

vi.mock("../common/Toaster", () => ({
  default: ({ type, message }: { type: string; message: string }) => (
    <div data-testid={`toaster-${type}`}>{message}</div>
  ),
}));

// Create a mock store
const createMockStore = (isAuthenticated = true, userId = "680f0d3771aacb0cb79a1a1e") => {
  return configureStore({
    reducer: {
      auth: () => ({
        isAuthenticated,
        user: { id: userId },
      }),
    },
  });
};

describe("Workouts Component", () => {
  const mockWorkouts = [
    {
      _id: "workout1",
      coachId: "coach1",
      clientId: "user123",
      type: "Yoga",
      date: "01-01-2023",
      time: "10:00",
      clientStatus: "Scheduled",
    },
    {
      _id: "workout2",
      coachId: "coach2",
      clientId: "user123",
      type: "Fitness",
      date: "02-01-2023",
      time: "11:00",
      clientStatus: "Waiting for feedback",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading skeletons initially", () => {
    api.get = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves to keep loading state

    render(
      <Provider store={createMockStore()}>
        <Workouts />
      </Provider>
    );

    expect(screen.getAllByTestId("skeleton")).toHaveLength(12); // 4 cards with 3 skeletons each
  });

  test("displays 'No workouts booked' when no workouts are available", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { workouts: [] } });

    render(
      <Provider store={createMockStore()}>
        <Workouts />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("not-available")).toBeInTheDocument();
      expect(screen.getByText("No workouts booked")).toBeInTheDocument();
    });
  });

  test("displays workouts when data is loaded", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { workouts: mockWorkouts } });

    render(
      <Provider store={createMockStore()}>
        <Workouts />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Yoga")).toBeInTheDocument();
      expect(screen.getByText("Fitness")).toBeInTheDocument();
      expect(screen.getByText("Scheduled")).toBeInTheDocument();
      expect(screen.getByText("Waiting for feedback")).toBeInTheDocument();
    });
  });

  test("shows cancel button for scheduled workouts", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { workouts: mockWorkouts } });

    render(
      <Provider store={createMockStore()}>
        <Workouts />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Cancel Workout")).toBeInTheDocument();
    });
  });

  test("shows feedback button for workouts waiting for feedback", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { workouts: mockWorkouts } });

    render(
      <Provider store={createMockStore()}>
        <Workouts />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Leave Feedback")).toBeInTheDocument();
    });
  });

  test("opens cancel modal when cancel button is clicked", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { workouts: mockWorkouts } });

    render(
      <Provider store={createMockStore()}>
        <Workouts />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Cancel Workout")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancel Workout"));
    
    // The modal should be open now
    expect(screen.getByTestId("cancel-modal")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to cancel this workout?")).toBeInTheDocument();
  });

  test("handles API error when fetching workouts", async () => {
    api.get = vi.fn().mockRejectedValue({ 
      response: { 
        data: { toastMessage: "Failed to fetch workouts" } 
      } 
    });

    render(
      <Provider store={createMockStore()}>
        <Workouts />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("toaster-error")).toBeInTheDocument();
      expect(screen.getByText("Failed to fetch workouts")).toBeInTheDocument();
    });
  });

  test("cancels workout successfully", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { workouts: mockWorkouts } });
    api.patch = vi.fn().mockResolvedValue({ 
      data: { toastMessage: "Workout cancelled successfully." } 
    });

    render(
      <Provider store={createMockStore()}>
        <Workouts />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Cancel Workout")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancel Workout"));
    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => {
      expect(screen.getByTestId("toaster-success")).toBeInTheDocument();
      expect(screen.getByText("Workout cancelled successfully.")).toBeInTheDocument();
    });
  });

  test("handles API error when cancelling workout", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { workouts: mockWorkouts } });
    api.patch = vi.fn().mockRejectedValue({ 
      response: { 
        data: { toastMessage: "Failed to cancel workout" } 
      } 
    });

    render(
      <Provider store={createMockStore()}>
        <Workouts />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Cancel Workout")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancel Workout"));
    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => {
      expect(screen.getByTestId("toaster-error")).toBeInTheDocument();
      expect(screen.getByText("Failed to cancel workout")).toBeInTheDocument();
    });
  });

  test("opens feedback modal and submits feedback", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { workouts: mockWorkouts } });

    render(
      <Provider store={createMockStore()}>
        <Workouts />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Leave Feedback")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leave Feedback"));
    
    // The modal should be open now
    expect(screen.getByTestId("feedback-modal")).toBeInTheDocument();
    
    // Submit feedback
    fireEvent.click(screen.getByText("Submit Feedback"));
    
    await waitFor(() => {
      expect(screen.getByTestId("toaster-success")).toBeInTheDocument();
      expect(screen.getByText("Feedback submitted successfully")).toBeInTheDocument();
    });
  });

  test("handles case when API returns null workouts", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { workouts: null } });

    render(
      <Provider store={createMockStore()}>
        <Workouts />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("not-available")).toBeInTheDocument();
      expect(screen.getByText("No workouts booked")).toBeInTheDocument();
    });
  });

  test("doesn't fetch workouts when user is not logged in", async () => {
    render(
      <Provider store={createMockStore(false, "")}>
        <Workouts />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("not-available")).toBeInTheDocument();
      expect(api.get).not.toHaveBeenCalled();
    });
  });
});