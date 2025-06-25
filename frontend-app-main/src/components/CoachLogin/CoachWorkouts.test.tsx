import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CoachDisplayWorkouts from "./CoachWorkouts";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import * as apiModule from "../../api/axios";
import { vi } from "vitest";
 
// Mock API
vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));
 
const mockWorkouts = [
  {
    _id: "1",
    coachId: "c1",
    clientId: "cl1",
    type: "Yoga",
    date: "20-05-2025",
    time: "10:00",
    coachStatus: "Scheduled",
  },
  {
    _id: "2",
    coachId: "c1",
    clientId: "cl2",
    type: "Fitness",
    date: "20-05-2025",
    time: "11:00",
    coachStatus: "Waiting for feedback",
  },
];
 
function renderWithStore(authState = { isAuthenticated: true, user: { id: "c1" } }) {
  const store = configureStore({
    reducer: {
      auth: (state = authState) => state,
    },
  });
  return render(
    <Provider store={store}>
      <CoachDisplayWorkouts />
    </Provider>
  );
}
 
describe("CoachDisplayWorkouts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
 
  it("renders loading skeletons initially", async () => {
    // Don't resolve the API call yet, so loading state persists
    (apiModule.default.get as any).mockImplementation(() => new Promise(() => {}));
    renderWithStore();
    // Skeletons don't have text, but you can check for their presence by role or class
    expect(document.querySelectorAll(".react-loading-skeleton").length).toBeGreaterThan(0);
  });
 
  it("renders workouts after successful fetch", async () => {
    (apiModule.default.get as any).mockResolvedValueOnce({
      data: { workouts: mockWorkouts },
    });
 
    renderWithStore();
 
    await waitFor(() => {
      expect(screen.getByText("Yoga")).toBeInTheDocument();
      expect(screen.getByText("Fitness")).toBeInTheDocument();
      expect(screen.getByText("Scheduled")).toBeInTheDocument();
      expect(screen.getByText("Waiting for feedback")).toBeInTheDocument();
    });
  });
 
  it("shows error message on fetch failure", async () => {
    (apiModule.default.get as any).mockRejectedValueOnce({
      message: "Failed to fetch workouts",
    });
 
    renderWithStore();
 
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch workouts/i)).toBeInTheDocument();
    });
  });
 
  it("shows NotAvailable when no workouts", async () => {
    (apiModule.default.get as any).mockResolvedValueOnce({
      data: { workouts: [] },
    });
 
    renderWithStore();
 
    await waitFor(() => {
      expect(screen.getByText(/no workouts booked/i)).toBeInTheDocument();
    });
  });
 
  it("opens feedback modal when 'Leave Feedback' is clicked", async () => {
    (apiModule.default.get as any).mockResolvedValueOnce({
      data: { workouts: mockWorkouts },
    });
 
    renderWithStore();
 
    await waitFor(() => {
      expect(screen.getByText("Leave Feedback")).toBeInTheDocument();
    });
 
    fireEvent.click(screen.getByText("Leave Feedback"));
    await waitFor(() => {
      // Check for a heading or a unique label in the modal
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /feedback/i })).toBeInTheDocument();
      const feedbackHeadings = screen.getAllByText(/feedback/i);
      expect(feedbackHeadings.length).toBeGreaterThan(0);
    });
  });
 
  it("opens cancel modal when 'Cancel Workout' is clicked", async () => {
    (apiModule.default.get as any).mockResolvedValueOnce({
      data: { workouts: mockWorkouts },
    });
 
    renderWithStore();
 
    await waitFor(() => {
      expect(screen.getByText("Cancel Workout")).toBeInTheDocument();
    });
 
    fireEvent.click(screen.getByText("Cancel Workout"));
  });
 
});