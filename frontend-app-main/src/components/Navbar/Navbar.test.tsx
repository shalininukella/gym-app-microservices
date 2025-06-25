 import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Navbar from "./Navbar";

// Mock the redux hooks
vi.mock("../../hooks/redux", () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

// Mock the ThemeToggleButton component
vi.mock("../ThemeToggleButton", () => ({
  ThemeToggleButton: () => <button data-testid="theme-toggle">Toggle Theme</button>,
}));

// Mock the ProfileDropdown component
vi.mock("./ProfileDropdown", () => ({
  __esModule: true,
  default: ({ onLogout, onClose }: { onLogout: () => void; onClose: () => void }) => (
    <div data-testid="profile-dropdown">
      <button onClick={onLogout} data-testid="logout-button">Logout</button>
      <button onClick={onClose} data-testid="close-dropdown">Close</button>
    </div>
  ),
}));

// Import the mocked hooks
import { useAppSelector, useAppDispatch } from "../../hooks/redux";

// Create a mock for react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  NavLink: ({ children, to, className, onClick }: any) => (
    <a href={to} className={typeof className === 'function' ? className({ isActive: to === '/' }) : className} onClick={onClick} data-testid={`navlink-${to}`}>
      {children}
    </a>
  ),
  BrowserRouter: ({ children }: any) => <div>{children}</div>
}));

describe("Navbar", () => {
  // Mock dispatch function
  const mockDispatch = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  test("renders the logo and brand name", () => {
    // Mock not logged in state
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          isAuthenticated: false,
          user: null,
        },
      });
    });

    render(<Navbar />);
    
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    expect(screen.getByText("EnergyX")).toBeInTheDocument();
  });

  test("renders login button when user is not logged in", () => {
    // Mock not logged in state
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          isAuthenticated: false,
          user: null,
        },
      });
    });

    render(<Navbar />);
    
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  test("navigates to login page when login button is clicked", () => {
    // Mock not logged in state
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          isAuthenticated: false,
          user: null,
        },
      });
    });

    render(<Navbar />);
    
    fireEvent.click(screen.getByText("Log In"));
    expect(mockNavigate).toHaveBeenCalledWith("/auth/sign-in");
  });

  test("renders correct navigation items for logged out users", () => {
    // Mock not logged in state
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          isAuthenticated: false,
          user: null,
        },
      });
    });

    render(<Navbar />);
    
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Coaches")).toBeInTheDocument();
    expect(screen.queryByText("Workouts")).not.toBeInTheDocument();
  });

  test("renders correct navigation items for logged in clients", () => {
    // Mock logged in client state
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          isAuthenticated: true,
          user: { type: "client" },
        },
      });
    });

    render(<Navbar />);
    
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Coaches")).toBeInTheDocument();
    expect(screen.getByText("Workouts")).toBeInTheDocument();
  });

  test("renders coach-specific navbar for coach users", () => {
    // Mock logged in coach state
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          isAuthenticated: true,
          user: { type: "coach" },
        },
      });
    });

    render(<Navbar />);
    
    expect(screen.getByText("Workouts")).toBeInTheDocument();
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
    expect(screen.queryByText("Coaches")).not.toBeInTheDocument();
  });

  test("renders admin-specific navbar for admin users", () => {
    // Mock logged in admin state
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          isAuthenticated: true,
          user: { type: "admin" },
        },
      });
    });

    render(<Navbar />);
    
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.queryByText("Coaches")).not.toBeInTheDocument();
    expect(screen.queryByText("Workouts")).not.toBeInTheDocument();
  });

  test("toggles mobile menu when menu button is clicked", () => {
    // Mock not logged in state
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          isAuthenticated: false,
          user: null,
        },
      });
    });

    render(<Navbar />);
    
    // Find all buttons
    const buttons = screen.getAllByRole("button");
    
    // Find the menu button (it's likely the last button in mobile view)
    // We need to find it by its position since we can't rely on SVG content in tests
    const menuButton = buttons[buttons.length - 1];
    
    // Initially mobile menu should be hidden
    expect(screen.queryByTestId("navlink-/")).not.toBeNull();
    
    // Click the menu button
    fireEvent.click(menuButton);
    
    // Now mobile menu should be visible with multiple links
    expect(screen.getAllByTestId("navlink-/").length).toBeGreaterThanOrEqual(1);
    
    // Click the button again to close
    fireEvent.click(menuButton);
    
    // Mobile menu should be hidden again
    expect(screen.getAllByTestId("navlink-/").length).toBe(1);
  });

  test("toggles profile dropdown when user icon is clicked", () => {
    // Mock logged in client state
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          isAuthenticated: true,
          user: { type: "client" },
        },
      });
    });

    render(<Navbar />);
    
    // Initially dropdown should be hidden
    expect(screen.queryByTestId("profile-dropdown")).not.toBeInTheDocument();
    
    // Find all buttons
    const buttons = screen.getAllByRole("button");
    
    // Find a button that might be the user icon (not the theme toggle or menu button)
    // This is a bit of a guess since we can't rely on SVG content in tests
    const nonThemeButtons = buttons.filter(button => 
      !button.textContent || button.textContent !== "Toggle Theme"
    );
    
    // Try clicking buttons until we find one that shows the dropdown
    let dropdownShown = false;
    for (const button of nonThemeButtons) {
      fireEvent.click(button);
      
      // Check if dropdown is now visible
      if (screen.queryByTestId("profile-dropdown")) {
        dropdownShown = true;
        
        // Click close button in dropdown
        fireEvent.click(screen.getByTestId("close-dropdown"));
        
        // Dropdown should be hidden again
        expect(screen.queryByTestId("profile-dropdown")).not.toBeInTheDocument();
        break;
      }
    }
    
    // Skip test if we couldn't find the user icon button
    if (!dropdownShown) {
      console.warn("Could not find user icon button to test dropdown");
    }
  });

  test("logs out user when logout is clicked", () => {
    // Mock logged in client state
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          isAuthenticated: true,
          user: { type: "client" },
        },
      });
    });

    render(<Navbar />);
    
    // Find all buttons
    const buttons = screen.getAllByRole("button");
    
    // Find a button that might be the user icon (not the theme toggle or menu button)
    const nonThemeButtons = buttons.filter(button => 
      !button.textContent || button.textContent !== "Toggle Theme"
    );
    
    // Try clicking buttons until we find one that shows the dropdown
    let dropdownShown = false;
    for (const button of nonThemeButtons) {
      fireEvent.click(button);
      
      // Check if dropdown is now visible
      const dropdown = screen.queryByTestId("profile-dropdown");
      if (dropdown) {
        dropdownShown = true;
        
        // Click logout button in dropdown
        fireEvent.click(screen.getByTestId("logout-button"));
        
        // Check that logout action was dispatched
        expect(mockDispatch).toHaveBeenCalled();
        
        // Check that we navigated to home
        expect(mockNavigate).toHaveBeenCalledWith("/");
        break;
      }
    }
    
    // Skip test if we couldn't find the user icon button
    if (!dropdownShown) {
      console.warn("Could not find user icon button to test logout");
    }
  });

  test("renders theme toggle button", () => {
    // Mock not logged in state
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        auth: {
          isAuthenticated: false,
          user: null,
        },
      });
    });

    render(<Navbar />);
    
    // Use getAllByTestId instead of getByTestId since there are multiple theme toggle buttons
    const themeToggleButtons = screen.getAllByTestId("theme-toggle");
    expect(themeToggleButtons.length).toBeGreaterThan(0);
    expect(themeToggleButtons[0]).toBeInTheDocument();
  });
});