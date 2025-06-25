 import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import CancelWorkoutModal from "./CancelWorkoutModal";

// Mock headlessui Dialog components with proper TypeScript types
vi.mock("@headlessui/react", () => ({
  Dialog: ({ children, open }: { 
    children: React.ReactNode; 
    open: boolean; 
    onClose: () => void;
    className?: string;
  }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogPanel: ({ children, className }: { 
    children: React.ReactNode; 
    className?: string;
  }) => (
    <div data-testid="dialog-panel" className={className}>{children}</div>
  ),
  DialogTitle: ({ children, className }: { 
    children: React.ReactNode; 
    className?: string;
  }) => (
    <h2 data-testid="dialog-title" className={className}>{children}</h2>
  ),
  Description: ({ children, className }: { 
    children: React.ReactNode; 
    className?: string;
  }) => (
    <p data-testid="dialog-description" className={className}>{children}</p>
  ),
}));

describe("CancelWorkoutModal", () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onCancelConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the modal when isOpen is true", () => {
    render(<CancelWorkoutModal {...mockProps} />);
    
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-title")).toHaveTextContent("Cancel Workout");
    expect(screen.getByTestId("dialog-description")).toBeInTheDocument();
  });

  test("does not render the modal when isOpen is false", () => {
    render(<CancelWorkoutModal {...mockProps} isOpen={false} />);
    
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dialog-title")).not.toBeInTheDocument();
  });

  test("calls onClose when the X button is clicked", () => {
    // Reset the mock before the test
    mockProps.onClose.mockReset();
    
    render(<CancelWorkoutModal {...mockProps} />);
    
    // Find the X button by its SVG content
    const closeButtons = screen.getAllByRole("button");
    const closeButton = closeButtons.find(button => 
      button.querySelector("svg")
    );
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
      expect(mockProps.onCancelConfirm).not.toHaveBeenCalled();
    } else {
      throw new Error("Close button not found");
    }
  });

  test("calls onClose when 'Resume Workout' button is clicked", () => {
    // Reset the mock before the test
    mockProps.onClose.mockReset();
    
    render(<CancelWorkoutModal {...mockProps} />);
    
    const resumeButton = screen.getByText("Resume Workout");
    fireEvent.click(resumeButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    expect(mockProps.onCancelConfirm).not.toHaveBeenCalled();
  });

  test("calls both onCancelConfirm and onClose when 'Cancel Workout' button is clicked", () => {
    // Reset the mocks before the test
    mockProps.onClose.mockReset();
    mockProps.onCancelConfirm.mockReset();
    
    render(<CancelWorkoutModal {...mockProps} />);
    
    const cancelButton = screen.getByRole("button", { name: "Cancel Workout" });
    fireEvent.click(cancelButton);
    
    expect(mockProps.onCancelConfirm).toHaveBeenCalledTimes(1);
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  test("has the correct button styling", () => {
    render(<CancelWorkoutModal {...mockProps} />);
    
    const resumeButton = screen.getByText("Resume Workout");
    const cancelButton = screen.getByRole("button", { name: "Cancel Workout" });
    
    // Check that the resume button has the correct styling classes
    expect(resumeButton.className).toContain("border");
    expect(resumeButton.className).toContain("bg-white");
    
    // Check that the cancel button has the correct styling classes
    expect(cancelButton.className).toContain("bg-[#8bc02a]");
    expect(cancelButton.className).toContain("text-white");
  });

  test("renders with correct accessibility attributes", () => {
    render(<CancelWorkoutModal {...mockProps} />);
    
    // Check for aria-hidden on the overlay
    const overlay = screen.getByTestId("dialog").querySelector(".fixed.inset-0.bg-black\\/30");
    if (overlay) {
      expect(overlay).toHaveAttribute("aria-hidden", "true");
    }
    
    // Check for dialog title and description
    expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-description")).toBeInTheDocument();
  });
});