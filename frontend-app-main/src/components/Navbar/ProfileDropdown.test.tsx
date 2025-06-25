//  import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ProfileDropdown from "./ProfileDropdown";

// Mock the redux hooks
vi.mock("../../hooks/redux", () => ({
  useAppSelector: vi.fn(),
}));

// Create a mock navigate function
const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Import the mocked hooks
import { useAppSelector } from "../../hooks/redux";

describe("ProfileDropdown", () => {
  // Mock props
  const mockProps = {
    onLogout: vi.fn(),
    onClose: vi.fn(),
  };

  // Mock user data
  const mockUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    type: "client",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          user: mockUser,
        },
      });
    });
  });

  test("renders user information correctly", () => {
    render(<ProfileDropdown {...mockProps} />);
    
    expect(screen.getByText("John Doe (Client)")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
  });

  test("renders My Account section", () => {
    render(<ProfileDropdown {...mockProps} />);
    
    expect(screen.getByText("My Account")).toBeInTheDocument();
    expect(screen.getByText("Edit account profile")).toBeInTheDocument();
  });

  test("renders Log Out button", () => {
    render(<ProfileDropdown {...mockProps} />);
    
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  test("calls onLogout when Log Out button is clicked", () => {
    render(<ProfileDropdown {...mockProps} />);
    
    fireEvent.click(screen.getByText("Log Out"));
    
    expect(mockProps.onLogout).toHaveBeenCalledTimes(1);
  });

  test("navigates to edit profile page when My Account is clicked", () => {
    render(<ProfileDropdown {...mockProps} />);
    
    // Find and click the My Account section
    const myAccountSection = screen.getByText("My Account").closest("div");
    if (myAccountSection) {
      fireEvent.click(myAccountSection);
    } else {
      throw new Error("My Account section not found");
    }
    
    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/edit-profile");
    
    // Check that onClose was called
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  test("handles user with missing type", () => {
    // Mock user without type
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          user: {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
          },
        },
      });
    });
    
    render(<ProfileDropdown {...mockProps} />);
    
    // Should display name without type
    expect(screen.getByText("John Doe ()")).toBeInTheDocument();
  });

  test("handles user with different type", () => {
    // Mock user with coach type
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          user: {
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@example.com",
            type: "coach",
          },
        },
      });
    });
    
    render(<ProfileDropdown {...mockProps} />);
    
    // Should display name with capitalized type
    expect(screen.getByText("Jane Smith (Coach)")).toBeInTheDocument();
  });

  test("calls onClose when clicked outside", () => {
    // Create a container to simulate outside clicks
    const container = document.createElement("div");
    document.body.appendChild(container);
    
    render(<ProfileDropdown {...mockProps} />, { container });
    
    // Simulate a click outside the dropdown
    fireEvent.mouseDown(document.body);
    
    // Check that onClose was called
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    
    // Clean up
    document.body.removeChild(container);
  });

  test("does not call onClose when clicked inside", () => {
    // Let's use a simpler approach for this test
    render(<ProfileDropdown {...mockProps} />);
    
    // Get the dropdown container
    // const dropdown = screen.getByText("Log Out").closest("div");
    
    // Mock the contains method to always return true (simulating click inside)
    const originalContains = Node.prototype.contains;
    Node.prototype.contains = vi.fn().mockReturnValue(true);
    
    // Simulate a mousedown event on the document
    fireEvent.mouseDown(document);
    
    // Check that onClose was not called
    expect(mockProps.onClose).not.toHaveBeenCalled();
    
    // Restore the original contains method
    Node.prototype.contains = originalContains;
  });
});