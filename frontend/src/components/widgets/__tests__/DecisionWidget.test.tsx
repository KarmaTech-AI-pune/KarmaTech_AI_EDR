import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DecisionWidget from '../DecisionWidget';

describe('DecisionWidget', () => {
  const mockProject = {
    id: 1,
    name: 'Test Project'
  };

  it('renders Bid Accepted and Bid Rejected buttons', () => {
    render(
      <DecisionWidget project={mockProject as any} />
    );

    expect(screen.getByRole('button', { name: /Bid Accepted/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bid Rejected/i })).toBeInTheDocument();
  });

  it('sets loading state on button click', () => {
    render(
      <DecisionWidget project={mockProject as any} />
    );

    const acceptButton = screen.getByRole('button', { name: /Bid Accepted/i });
    fireEvent.click(acceptButton);

    // After clicking, button should be disabled
    expect(acceptButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /Bid Rejected/i })).toBeDisabled();
  });
});
