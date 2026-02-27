import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ChangeControlDialog } from './ChangeControlDialog';

describe('ChangeControlDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const baseProps = {
    open: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    nextSrNo: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly for adding a new change control', () => {
    render(<ChangeControlDialog {...baseProps} />);
    
    expect(screen.getByText('Add Change Control - Sr. No: 5')).toBeInTheDocument();
    expect(screen.getByLabelText(/Date Logged/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Originator/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('pre-populates data when editData is provided', () => {
    const editData = {
      id: 1,
      projectId: 1,
      srNo: 3,
      dateLogged: '2023-05-15',
      originator: 'Jane Doe',
      description: 'Scope change',
      costImpact: '$500',
      timeImpact: '2 days',
      resourcesImpact: '',
      qualityImpact: '',
      changeOrderStatus: 'Proposed',
      clientApprovalStatus: 'Pending',
      claimSituation: 'None'
    };

    render(<ChangeControlDialog {...baseProps} editData={editData} />);
    
    expect(screen.getByText('Edit Change Control - Sr. No: 3')).toBeInTheDocument();
    expect((screen.getByLabelText(/Originator/i) as HTMLInputElement).value).toBe('Jane Doe');
    expect((screen.getByLabelText(/Description/i) as HTMLInputElement).value).toBe('Scope change');
    expect((screen.getByLabelText(/Cost Impact/i) as HTMLInputElement).value).toBe('$500');
  });

  it('validates required fields preventing submission and showing alert', async () => {
    // Render with empty data
    render(<ChangeControlDialog {...baseProps} />);
    
    // Attempt to save immediately
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    
    expect(screen.getByText(/Please fill in all required fields./i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('successfully submits data when required fields are filled', async () => {
    render(<ChangeControlDialog {...baseProps} />);
    
    fireEvent.change(screen.getByLabelText(/Date Logged/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/Originator/i), { target: { value: 'John Smith' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Design update' } });
    fireEvent.change(screen.getByLabelText(/Cost Impact/i), { target: { value: '1000' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const submittedData = mockOnSave.mock.calls[0][0];
      expect(submittedData.originator).toBe('John Smith');
      expect(submittedData.description).toBe('Design update');
      expect(submittedData.costImpact).toBe('1000');
      // Verify other text fields that were left empty default to ''
      expect(submittedData.timeImpact).toBe('');
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ChangeControlDialog {...baseProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
