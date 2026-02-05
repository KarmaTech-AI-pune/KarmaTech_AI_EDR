import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateProgramDialog from './CreateProgramDialog';
import { programApi } from '../../services/api/programApi';

// Mock the programApi
vi.mock('../../services/api/programApi', () => ({
  programApi: {
    create: vi.fn()
  }
}));

// Mock window.confirm
const mockConfirm = vi.fn();
global.confirm = mockConfirm;

describe('CreateProgramDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it('renders dialog when open', () => {
    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Create New Program')).toBeInTheDocument();
  });

  it('does not render dialog when closed', () => {
    render(
      <CreateProgramDialog
        open={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText('Create New Program')).not.toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByLabelText(/Program Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
  });

  it('shows validation error for empty name', async () => {
    const user = userEvent.setup();
    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Create Program/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for empty description', async () => {
    const user = userEvent.setup();
    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Create Program/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });

  it('shows validation error when end date is before start date', async () => {
    const user = userEvent.setup();
    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Program Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const startDateInput = screen.getByLabelText(/Start Date/i);
    const endDateInput = screen.getByLabelText(/End Date/i);

    await user.type(nameInput, 'Test Program');
    await user.type(descriptionInput, 'Test Description');
    await user.type(startDateInput, '2025-12-31');
    await user.type(endDateInput, '2025-01-01');

    const submitButton = screen.getByRole('button', { name: /Create Program/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    vi.mocked(programApi.create).mockResolvedValue(1);

    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Program Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const startDateInput = screen.getByLabelText(/Start Date/i);

    await user.type(nameInput, 'Test Program');
    await user.type(descriptionInput, 'Test Description');
    await user.type(startDateInput, '2025-01-01');

    const submitButton = screen.getByRole('button', { name: /Create Program/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(programApi.create).toHaveBeenCalledWith({
        name: 'Test Program',
        description: 'Test Description',
        startDate: '2025-01-01',
        endDate: null
      });
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('displays loading state during submission', async () => {
    const user = userEvent.setup();
    vi.mocked(programApi.create).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(1), 100))
    );

    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Program Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const startDateInput = screen.getByLabelText(/Start Date/i);

    await user.type(nameInput, 'Test Program');
    await user.type(descriptionInput, 'Test Description');
    await user.type(startDateInput, '2025-01-01');

    const submitButton = screen.getByRole('button', { name: /Create Program/i });
    await user.click(submitButton);

    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });

  it('displays API error message', async () => {
    const user = userEvent.setup();
    vi.mocked(programApi.create).mockRejectedValue({
      response: { data: { message: 'API Error' } }
    });

    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Program Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const startDateInput = screen.getByLabelText(/Start Date/i);

    await user.type(nameInput, 'Test Program');
    await user.type(descriptionInput, 'Test Description');
    await user.type(startDateInput, '2025-01-01');

    const submitButton = screen.getByRole('button', { name: /Create Program/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('shows confirmation when closing with unsaved changes', async () => {
    const user = userEvent.setup();
    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Program Name/i);
    await user.type(nameInput, 'Test');

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      'You have unsaved changes. Are you sure you want to close?'
    );
  });

  it('closes without confirmation when no changes made', async () => {
    const user = userEvent.setup();
    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('allows submission with only required fields', async () => {
    const user = userEvent.setup();
    vi.mocked(programApi.create).mockResolvedValue(1);

    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Program Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);

    await user.type(nameInput, 'Minimal Program');
    await user.type(descriptionInput, 'Minimal Description');

    const submitButton = screen.getByRole('button', { name: /Create Program/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(programApi.create).toHaveBeenCalledWith({
        name: 'Minimal Program',
        description: 'Minimal Description',
        startDate: null,
        endDate: null
      });
    });
  });

  it('disables submit button during submission', async () => {
    const user = userEvent.setup();
    vi.mocked(programApi.create).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(1), 100))
    );

    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Program Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);

    await user.type(nameInput, 'Test Program');
    await user.type(descriptionInput, 'Test Description');

    const submitButton = screen.getByRole('button', { name: /Create Program/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it('validates name length', async () => {
    const user = userEvent.setup();
    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Program Name/i);
    const longName = 'A'.repeat(256); // Exceeds max length
    await user.type(nameInput, longName);

    const submitButton = screen.getByRole('button', { name: /Create Program/i });
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/name.*too long/i) || screen.queryByText(/maximum.*255/i);
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
      }
    });
  });

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup();
    vi.mocked(programApi.create).mockRejectedValue(new Error('Network error'));

    render(
      <CreateProgramDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Program Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);

    await user.type(nameInput, 'Test Program');
    await user.type(descriptionInput, 'Test Description');

    const submitButton = screen.getByRole('button', { name: /Create Program/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create program/i)).toBeInTheDocument();
    });
  });
});
