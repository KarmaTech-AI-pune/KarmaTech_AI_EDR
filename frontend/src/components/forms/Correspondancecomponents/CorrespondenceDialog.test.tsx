import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CorrespondenceDialog from './CorrespondenceDialog';

describe('CorrespondenceDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const baseProps = {
    open: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly for adding an INWARD correspondence', () => {
    render(<CorrespondenceDialog {...baseProps} type="inward" />);
    
    expect(screen.getByText('Add Inward Correspondence')).toBeInTheDocument();
  });

  it('renders correctly for adding an OUTWARD correspondence', () => {
    render(<CorrespondenceDialog {...baseProps} type="outward" />);
    
    expect(screen.getByText('Add Outward Correspondence')).toBeInTheDocument();
    
    // Outward specific fields
    expect(screen.getByLabelText(/Letter No/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Letter Date/i)).toBeInTheDocument();
    // Use more specific matcher for "To" as it might match "Total Cost" or similar
    expect(screen.getByLabelText(/^To/)).toBeInTheDocument();
  });

  it('populates fields properly in Edit mode (Inward) and includes _isEditOperation', async () => {
    const editData = {
      id: 5,
      incomingLetterNo: 'IL-001',
      letterDate: '2023-01-01',
      inwardNo: 'IN-001',
      receiptDate: '2023-01-02',
      from: 'John',
      subject: 'Hello',
      attachmentDetails: 'doc.pdf',
      actionTaken: 'Reviewed',
      storagePath: '/documents',
      remarks: 'None',
      repliedDate: '2023-01-04'
    };

    render(<CorrespondenceDialog {...baseProps} type="inward" editData={editData as any} isEdit={true} />);
    
    expect(screen.getByText('Edit Inward Correspondence')).toBeInTheDocument();
    
    // Update button click
    fireEvent.click(screen.getByRole('button', { name: /Update/i }));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const payload = mockOnSave.mock.calls[0][0];
      expect(payload._isEditOperation).toBe(true);
      expect(payload.id).toBe(5);
    });
  });

  it('validates required fields preventing submission', async () => {
    render(<CorrespondenceDialog {...baseProps} type="inward" />);
    
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    
    expect(screen.getByText(/Incoming Letter No is required/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('successfully submits data for outward when required fields are filled', async () => {
    render(<CorrespondenceDialog {...baseProps} type="outward" />);
    
    fireEvent.change(screen.getByLabelText(/Letter No/i), { target: { value: 'OL-001' } });
    fireEvent.change(screen.getByLabelText(/Letter Date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/^To/), { target: { value: 'TechCo' } });
    fireEvent.change(screen.getByLabelText(/Subject/i), { target: { value: 'Launch Details' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('cancels dialog when cancel button clicked', () => {
    render(<CorrespondenceDialog {...baseProps} type="inward" />);
    
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
