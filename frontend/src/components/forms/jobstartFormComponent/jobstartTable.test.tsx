import { vi, describe, it, expect, beforeEach } from 'vitest';
// import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobStartTable from './jobstartTable';

describe('JobStartTable', () => {
  const mockRows = [
    { id: 'row-1', activity: 'Activity 1', responsibility: 'Resp 1', targetDate: '2023-01-01', status: 'Pending', remarks: 'Remark 1' },
    { id: 'row-2', activity: 'Activity 2', responsibility: 'Resp 2', targetDate: '2023-01-02', status: 'In Progress', remarks: 'Remark 2' },
  ];

  const mockOnRowsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial rows', () => {
    render(
      <JobStartTable
        rows={mockRows}
        onRowsChange={mockOnRowsChange}
      />
    );

    // Check if headers are rendered
    expect(screen.getByText('No.')).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('Responsibility')).toBeInTheDocument();
    expect(screen.getByText('Target Date')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Remarks')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check if initial rows are rendered
    expect(screen.getByDisplayValue('Activity 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Resp 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Remark 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Activity 2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Resp 2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Remark 2')).toBeInTheDocument();
  });

  it('adds a new row when "Add Activity" button is clicked', () => {
    render(
      <JobStartTable
        rows={[]}
        onRowsChange={mockOnRowsChange}
      />
    );

    const addButton = screen.getByRole('button', { name: /Add Activity/i });
    fireEvent.click(addButton);

    // Expect onRowsChange to be called with a new row
    expect(mockOnRowsChange).toHaveBeenCalledTimes(1);
    const addedRow = mockOnRowsChange.mock.calls[0][0][0]; // Get the first row from the first call
    expect(addedRow.activity).toBe('');
    expect(addedRow.responsibility).toBe('');
    expect(addedRow.targetDate).toBe('');
    expect(addedRow.status).toBe('');
    expect(addedRow.remarks).toBe('');
    expect(addedRow.id).toBeDefined(); // Ensure an ID is generated
  });

  it('deletes a row when delete button is clicked', () => {
    render(
      <JobStartTable
        rows={mockRows}
        onRowsChange={mockOnRowsChange}
      />
    );

    // Find the delete button for the first row
    const firstRowElement = screen.getByDisplayValue('Activity 1').closest('tr');
    const deleteButton = within(firstRowElement!).getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Expect onRowsChange to be called with the remaining rows
    expect(mockOnRowsChange).toHaveBeenCalledTimes(1);
    expect(mockOnRowsChange).toHaveBeenCalledWith([mockRows[1]]);
  });

  it('updates row data when text fields are changed', () => {
    render(
      <JobStartTable
        rows={mockRows}
        onRowsChange={mockOnRowsChange}
      />
    );

    // Find the activity text field for the first row and change its value
    const firstRowElement = screen.getByDisplayValue('Activity 1').closest('tr');
    const activityInput = within(firstRowElement!).getByRole('textbox', { name: /activity/i });
    fireEvent.change(activityInput, { target: { value: 'Updated Activity 1' } });

    // Expect onRowsChange to be called with the updated row
    expect(mockOnRowsChange).toHaveBeenCalledTimes(1);
    expect(mockOnRowsChange).toHaveBeenCalledWith([
      { ...mockRows[0], activity: 'Updated Activity 1' },
      mockRows[1],
    ]);
  });

  it('renders in read-only mode correctly', async () => {
    render(
      <JobStartTable
        rows={mockRows}
        onRowsChange={mockOnRowsChange}
        readOnly={true}
      />
    );

    // Check that action buttons are not present
    await waitFor(() => expect(screen.queryByText('Actions')).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add Activity/i })).not.toBeInTheDocument();

    // Check that data is displayed as text, not input fields
    expect(screen.getByText('Activity 1')).toBeInTheDocument();
    expect(screen.getByText('Resp 1')).toBeInTheDocument();
    expect(screen.getByText('Remark 1')).toBeInTheDocument();
  });

  it('displays "No activities added yet" message when rows are empty', () => {
    render(
      <JobStartTable
        rows={[]}
        onRowsChange={mockOnRowsChange}
      />
    );

    expect(screen.getByText('No activities added yet.')).toBeInTheDocument();
  });
});


