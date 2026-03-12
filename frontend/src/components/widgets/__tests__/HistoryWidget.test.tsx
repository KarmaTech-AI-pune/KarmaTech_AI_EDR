import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HistoryWidget } from '../HistoryWidget';

describe('HistoryWidget', () => {
  const mockHistories = [
    {
      opportunityId: 1,
      date: '2023-10-27T10:00:00Z',
      description: 'Bid submitted',
    },
    {
      opportunityId: 2,
      date: '2023-10-28T14:30:00Z',
      description: 'Review completed',
    }
  ];

  it('renders the History button initially', () => {
    render(
      <HistoryWidget histories={mockHistories as any} />
    );

    expect(screen.getByRole('button', { name: /History/i })).toBeInTheDocument();
  });

  it('opens a drawer when the history button is clicked and displays items', async () => {
    render(
      <HistoryWidget histories={mockHistories as any} title="Custom History Hub" />
    );

    const button = screen.getByRole('button', { name: /History/i });
    fireEvent.click(button);

    await waitFor(() => {
      // Custom title check
      expect(screen.getByText('Custom History Hub')).toBeInTheDocument();
      // Description check
      expect(screen.getByText('Bid submitted')).toBeInTheDocument();
      expect(screen.getByText('Review completed')).toBeInTheDocument();
    });
  });

  it('formats dates in the list items', async () => {
     render(
      <HistoryWidget histories={[mockHistories[0]] as any} />
    );
     
    fireEvent.click(screen.getByRole('button', { name: /History/i }));

    await waitFor(() => {
      // We expect the date to be formatted in US locale e.g., October 27, 2023
      expect(screen.getByText(/October 27, 2023/)).toBeInTheDocument();
    });
  });
});
