import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeTrackingWidget } from '../TimeTrackingWidget';

describe('TimeTrackingWidget', () => {
  it('renders time tracking components', () => {
    render(
      <TimeTrackingWidget
        taskName="Test Task"
        reporterName="Test User"
        originalEstimate={10}
        remainingEstimate={5}
        timeSpent={5}
        onLogWork={vi.fn()}
      />
    );

    expect(screen.getByText('Employee Work Log')).toBeInTheDocument();
    expect(screen.getByText('Work Approver')).toBeInTheDocument();
    expect(screen.getByText('5h')).toBeInTheDocument(); // Remaining hours
  });

  it('opens log work modal and allows submission', async () => {
    const onLogWorkMock = vi.fn();
    render(
      <TimeTrackingWidget
        taskName="Test Task"
        reporterName="Test User"
        originalEstimate={10}
        remainingEstimate={5}
        timeSpent={5}
        onLogWork={onLogWorkMock}
      />
    );

    // Click Work Approver button (EditIcon)
    const editButton = screen.getByTestId('EditIcon'); 
    fireEvent.click(editButton);
    
    expect(screen.getByText('Work Approve')).toBeInTheDocument();
    
    // Enter time
    const input = screen.getByLabelText(/Actual work time spent/i);
    fireEvent.change(input, { target: { value: '2' } });
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /Work Report Submit/i });
    fireEvent.click(submitButton);
    
    expect(onLogWorkMock).toHaveBeenCalledWith(2, 3, '', 'reporter');
  });
});
