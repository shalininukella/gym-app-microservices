import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CoachWorkoutFeedbackModal from "./CoachWorkoutFeedbackModal";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import * as apiModule from "../../api/axios";
import { vi } from "vitest";
 
vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
 
const mockClient = {
  _id: "cl1",
  firstName: "John",
  lastName: "Doe",
  type: "Premium",
  profilePic: "test.jpg",
  rating: 5,
  title: "Client",
};
 
function renderWithStore(props: any) {
  const store = configureStore({
    reducer: {
      auth: () => ({ user: { id: "coach1" } }),
    },
  });
  return render(
    <Provider store={store}>
      <CoachWorkoutFeedbackModal {...props} />
    </Provider>
  );
}
 
describe("CoachWorkoutFeedbackModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    onStatusUpdate: vi.fn(),
    onToasterMessage: vi.fn(),
    clientId: "cl1",
    workoutId: "w1",
    type: "Yoga",
    time: "1hr",
    date: "May 20, 10:00 AM",
  };
 
  beforeEach(() => {
    vi.clearAllMocks();
  });
 
  it("renders loading skeletons when loading client", async () => {
    (apiModule.default.get as any).mockImplementation(() => new Promise(() => {}));
    renderWithStore(defaultProps);
    expect(document.querySelectorAll(".react-loading-skeleton").length).toBeGreaterThan(0);
  });
 
  it("renders client info after loading", async () => {
    (apiModule.default.get as any).mockResolvedValueOnce({ data: { user: mockClient } });
    renderWithStore(defaultProps);
 
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("(Premium)")).toBeInTheDocument();
      expect(screen.getByText(/Type:/i)).toBeInTheDocument();
      expect(screen.getByText(/Yoga/i)).toBeInTheDocument();
      expect(screen.getByText(/Time:/i)).toBeInTheDocument();
      expect(screen.getByText(/1hr/i)).toBeInTheDocument();
      expect(screen.getByText(/Date:/i)).toBeInTheDocument();
      expect(screen.getByText(/May 20, 10:00 AM/i)).toBeInTheDocument();
    });
  });
 
  it("calls onClose when close button is clicked", async () => {
    (apiModule.default.get as any).mockResolvedValueOnce({ data: { user: mockClient } });
    renderWithStore(defaultProps);
 
    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
 
    // The close button is the first button rendered
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
 
  it("submits feedback and calls callbacks", async () => {
    (apiModule.default.get as any).mockResolvedValueOnce({ data: { user: mockClient } });
    (apiModule.default.post as any).mockResolvedValueOnce({ data: { toastMessage: "Feedback submitted!" } });
 
    renderWithStore(defaultProps);
 
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
 
    fireEvent.change(screen.getByPlaceholderText(/add your comments/i), {
      target: { value: "Great session!" },
    });
 
    fireEvent.click(screen.getByRole("button", { name: /submit feedback/i }));
 
    await waitFor(() => {
      expect(apiModule.default.post).toHaveBeenCalled();
      expect(defaultProps.onToasterMessage).toHaveBeenCalledWith("success", "Feedback submitted!");
      expect(defaultProps.onStatusUpdate).toHaveBeenCalledWith("w1", "Finished");
      expect(defaultProps.onSubmit).toHaveBeenCalledWith("Great session!");
    });
  });
 
  it("shows error and calls onToasterMessage on API error", async () => {
    (apiModule.default.get as any).mockResolvedValueOnce({ data: { user: mockClient } });
    (apiModule.default.post as any).mockRejectedValueOnce({
      response: { data: { toastMessage: "Error submitting feedback" } },
    });
 
    renderWithStore(defaultProps);
 
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
 
    fireEvent.change(screen.getByPlaceholderText(/add your comments/i), {
      target: { value: "Bad session" },
    });
 
    fireEvent.click(screen.getByRole("button", { name: /submit feedback/i }));
 
    await waitFor(() => {
      expect(defaultProps.onToasterMessage).toHaveBeenCalledWith("error", "Error submitting feedback");
    });
  });
 
  it("does not render when isOpen is false", () => {
    renderWithStore({ ...defaultProps, isOpen: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});