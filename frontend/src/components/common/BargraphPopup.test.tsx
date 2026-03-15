import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BargraphPopup from './BargraphPopup';

describe('BargraphPopup Component', () => {
  const mockOnClose = vi.fn();
  const mockOnViewDetails = vi.fn();

  const sampleOpportunities = [
    { id: 1, name: 'Opp #1' },
    { id: 2, name: 'Opp #2' }
  ];

  it('renders correctly with given parameters', () => {
    render(
      <BargraphPopup
        open={true}
        title="Opportunities Summary"
        categoryName="Water Infrastructure"
        stateName="Tendering"
        opportunities={sampleOpportunities}
        onClose={mockOnClose}
        onViewDetails={mockOnViewDetails}
      />
    );

    // Verify Title
    expect(screen.getByText('Opportunities Summary')).toBeInTheDocument();

    // Verify descriptive text logic
    expect(screen.getByText(/There/)).toBeInTheDocument();
    expect(screen.getByText(/2 opportunities/)).toBeInTheDocument();
    expect(screen.getByText(/in the Tendering state for Water Infrastructure\./)).toBeInTheDocument();

    // Verify Lists are rendered
    expect(screen.getByText('• Opp #1')).toBeInTheDocument();
    expect(screen.getByText('• Opp #2')).toBeInTheDocument();
  });

  it('pluralizes description correctly for single opportunity', () => {
    render(
      <BargraphPopup
        open={true}
        title="Single Opp Summary"
        categoryName="Solar"
        stateName="Won"
        opportunities={[{ id: 99, name: 'Big Solar Win' }]}
        onClose={mockOnClose}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText(/is/)).toBeInTheDocument();
    expect(screen.getByText(/1 opportunity/)).toBeInTheDocument();
  });

  it('calls onClose when Close is clicked', () => {
    render(
      <BargraphPopup
        open={true}
        title="Close Test"
        categoryName="Test"
        stateName="Testing"
        opportunities={[]}
        onClose={mockOnClose}
        onViewDetails={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onViewDetails when View Details is clicked', () => {
    render(
      <BargraphPopup
        open={true}
        title="View Details Test"
        categoryName="Test"
        stateName="Testing"
        opportunities={[]}
        onClose={vi.fn()}
        onViewDetails={mockOnViewDetails}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /View Details/i }));
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });
});
