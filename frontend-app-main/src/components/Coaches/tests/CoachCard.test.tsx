import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CoachCard from '../CoachProfiles/CoachCard';
import { describe, it, expect } from 'vitest';

const mockCoach = {
  _id: 'coach1',
  firstName: 'Jane',
  lastName: 'Doe',
  title: 'Yoga',
  rating: 4.8,
  profilePic: 'https://example.com/profile.jpg',
  type: 'Yoga',
};

describe('CoachCard', () => {
  it('renders coach name and title', () => {
    render(
      <BrowserRouter>
        <CoachCard coach={mockCoach} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Yoga/)).toBeInTheDocument();
  });

  it('displays rating correctly', () => {
    render(
      <BrowserRouter>
        <CoachCard coach={mockCoach} />
      </BrowserRouter>
    );

    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('renders profile image with correct alt text', () => {
    render(
      <BrowserRouter>
        <CoachCard coach={mockCoach} />
      </BrowserRouter>
    );

    const img = screen.getByAltText('Jane') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('https://example.com/profile.jpg');
  });

  it('navigates to correct link when Book Workout is clicked', () => {
    render(
      <BrowserRouter>
        <CoachCard coach={mockCoach} />
      </BrowserRouter>
    );

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/coach-profile/coach1');
  });
});
