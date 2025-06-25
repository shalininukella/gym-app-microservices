import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FeedbackCard from "../Feedbacks/FeedbackCard";

describe("FeedbackCard", () => {
  const feedback = {
    clientImageUrl: "https://example.com/avatar.jpg",
    clientName: "John Doe",
    date: "2023-06-10",
    message: "Great product!",
    rating: "4",
  };

  it("renders the client name correctly", () => {
    render(<FeedbackCard feedback={feedback} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders the formatted date correctly", () => {
    render(<FeedbackCard feedback={feedback} />);
    expect(screen.getByText("06/10/2023")).toBeInTheDocument();
  });

  it("renders the feedback message correctly", () => {
    render(<FeedbackCard feedback={feedback} />);
    expect(screen.getByText("Great product!")).toBeInTheDocument();
  });


  it("renders the client avatar with the correct source", () => {
    render(<FeedbackCard feedback={feedback} />);
    const avatar = screen.getByAltText("John Doe");
    expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });
});