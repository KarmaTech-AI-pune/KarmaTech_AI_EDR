import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InputRegisterDialog from './InputRegisterDialog';
import { createInputRegister, updateInputRegister } from '../../../api/inputRegisterApi';

vi.mock('../../../api/inputRegisterApi', () => ({
  createInputRegister: vi.fn(),
  updateInputRegister: vi.fn()
}));

describe('InputRegisterDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const baseProps = {
    open: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    projectId: '123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly for adding a new input register', () => {
    render(<InputRegisterDialog {...baseProps} />);
    
    expect(screen.getByText('Add Input Register Entry')).toBeInTheDocument();
  });

  it('renders correctly in edit mode', () => {
    const editData = {
      id: '42',
      projectId: '123',
      dataReceived: 'Client Schema',
      receiptDate: '2023-01-01',
      receivedFrom: 'Client IT',
      filesFormat: 'JSON',
      noOfFiles: 2,
      fitForPurpose: true,
      check: true,
      checkedBy: 'PM',
      checkedDate: '2023-01-02',
      custodian: 'Admin',
      storagePath: '/docs',
      remarks: 'Done'
    };

    render(<InputRegisterDialog {...baseProps} initialData={editData as any} />);
    
    expect(screen.getByText('Edit Input Register Entry')).toBeInTheDocument();
    expect((screen.getByLabelText(/Data Received/i) as HTMLInputElement).value).toBe('Client Schema');
  });

  it('creates new InputRegister successfully', async () => {
    (createInputRegister as any).mockResolvedValue({ id: '10', dataReceived: 'New Input' });

    render(<InputRegisterDialog {...baseProps} />);
    
    fireEvent.change(screen.getByLabelText(/Data Received/i), { target: { value: 'New Input' } });
    fireEvent.change(screen.getByLabelText(/Received From/i), { target: { value: 'Sender A' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Add Entry/i }));
    
    await waitFor(() => {
      expect(createInputRegister).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith({ id: '10', dataReceived: 'New Input' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('updates existing InputRegister when in edit mode', async () => {
    const editData = { id: '99', projectId: '123', dataReceived: 'Old' };
    (updateInputRegister as any).mockResolvedValue({ id: '99', dataReceived: 'Updated' });

    render(<InputRegisterDialog {...baseProps} initialData={editData as any} />);
    
    fireEvent.change(screen.getByLabelText(/Data Received/i), { target: { value: 'Updated' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    
    await waitFor(() => {
      expect(updateInputRegister).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith({ id: '99', dataReceived: 'Updated' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('cancels dialog when cancel button clicked', () => {
    render(<InputRegisterDialog {...baseProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
