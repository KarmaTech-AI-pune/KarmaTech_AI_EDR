import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MilestoneBillingTracker from './MilestoneBillingTracker';

vi.mock('../../utils/formatters', () => ({
  formatCurrency: (val: number) => `$${val}`
}));

describe('MilestoneBillingTracker Component', () => {
  const mockMilestones = [
    {
      id: 1,
      project: 'Project A',
      milestone: 'Design Phase',
      expectedAmount: 10000,
      status: 'On Track' as const,
      daysDelayed: 0,
      penalty: 0
    },
    {
      id: 2,
      project: 'Project B',
      milestone: 'Launch',
      expectedAmount: 50000,
      status: 'Overdue' as const,
      daysDelayed: 12,
      penalty: 500
    },
    {
      id: 3,
      project: 'Project C',
      milestone: 'Testing',
      expectedAmount: 5000,
      status: 'At Risk' as const,
      daysDelayed: 0,
      penalty: 0
    }
  ];

  it('renders table rows for all milestones', () => {
    render(
      <MilestoneBillingTracker 
        milestones={mockMilestones} 
        onSendNotice={vi.fn()} 
        onFollowUp={vi.fn()} 
      />
    );

    expect(screen.getByText('Milestone & Billing Tracker')).toBeInTheDocument();

    // Project names
    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Project B')).toBeInTheDocument();
    expect(screen.getByText('Project C')).toBeInTheDocument();

    // Status Chips
    expect(screen.getByText('On Track')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('At Risk')).toBeInTheDocument();
    
    // Penalties / Delays
    expect(screen.getByText('12 days')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
  });

  it('calls onSendNotice when Overdue action is clicked', () => {
    const mockOnSendNotice = vi.fn();
    render(
      <MilestoneBillingTracker 
        milestones={mockMilestones} 
        onSendNotice={mockOnSendNotice} 
        onFollowUp={vi.fn()} 
      />
    );

    const sendNoticeBtn = screen.getByRole('button', { name: /send notice/i });
    fireEvent.click(sendNoticeBtn);

    expect(mockOnSendNotice).toHaveBeenCalledWith(2); // Project B id
  });

  it('calls onFollowUp when At Risk action is clicked', () => {
    const mockOnFollowUp = vi.fn();
    render(
      <MilestoneBillingTracker 
        milestones={mockMilestones} 
        onSendNotice={vi.fn()} 
        onFollowUp={mockOnFollowUp} 
      />
    );

    const followUpBtn = screen.getByRole('button', { name: /follow up/i });
    fireEvent.click(followUpBtn);

    expect(mockOnFollowUp).toHaveBeenCalledWith(3); // Project C id
  });
});
