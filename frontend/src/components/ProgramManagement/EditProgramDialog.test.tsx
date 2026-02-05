import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import EditProgramDialog from './EditProgramDialog';
import { programApi } from '../../services/api/programApi';
import { Program } from '../../types/program';

// Mock the programApi
vi.mock('../../services/api/programApi', () => ({
  programApi: {
    update: vi.fn()
  }
}));

describe('EditProgramDialog', () => {
  const mockProgram: Program = {
    id: 1,
    name: 'Test Program',
    description: 'Test Description',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T00:00:00Z'
  };

  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls update API with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    
    // Mock successful API call
    vi.mocked(programApi.update).mockResolvedValue(undefined);

    render(
      <EditProgramDialog
        open={true}
        program={mockProgram}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Verify form is pre-filled with formatted dates
    expect(screen.getByLabelText(/program name/i)).toHaveValue('Test Program');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Test Description');
    expect(screen.getByLabelText(/start date/i)).toHaveValue('2025-01-01');
    expect(screen.getByLabelText(/end date/i)).toHaveValue('2025-12-31');

    // Change the name
    const nameInput = screen.getByLabelText(/program name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Program Name');

    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Verify API was called with correct data (including id field)
    await waitFor(() => {
      expect(programApi.update).toHaveBeenCalledWith(1, {
        name: 'Updated Program Name',
        description: 'Test Description',
        startDate: '2025-01-01',
        endDate: '2025-12-31'
      });
    });

    // Verify success callback was called
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    // Verify dialog was closed
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('displays error message when update API fails', async () => {
    const user = userEvent.setup();
    
    // Mock API failure
    const errorMessage = 'Failed to update program';
    vi.mocked(programApi.update).mockRejectedValue(
      new Error(errorMessage)
    );

    render(
      <EditProgramDialog
        open={true}
        program={mockProgram}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Change the name
    const nameInput = screen.getByLabelText(/program name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Program Name');

    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to update program/i)).toBeInTheDocument();
    });

    // Verify success callback was NOT called
    expect(mockOnSuccess).not.toHaveBeenCalled();

    // Verify dialog was NOT closed
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('shows confirmation dialog when closing with unsaved changes', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <EditProgramDialog
        open={true}
        program={mockProgram}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Make a change
    const nameInput = screen.getByLabelText(/program name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed Name');

    // Try to close
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Verify confirmation was shown
    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith(
        'You have unsaved changes. Are you sure you want to close?'
      );
    });

    // Verify dialog was NOT closed (user clicked "No")
    expect(mockOnClose).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('closes without confirmation when no changes made', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm');

    render(
      <EditProgramDialog
        open={true}
        program={mockProgram}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('validates end date is after start date', async () => {
    const user = userEvent.setup();

    render(
      <EditProgramDialog
        open={true}
        program={mockProgram}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    await user.clear(startDateInput);
    await user.type(startDateInput, '2025-12-31');
    
    await user.clear(endDateInput);
    await user.type(endDateInput, '2025-01-01');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
    });
  });

  it('disables submit button during update', async () => {
    const user = userEvent.setup();
    vi.mocked(programApi.update).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(undefined), 100))
    );

    render(
      <EditProgramDialog
        open={true}
        program={mockProgram}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/program name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(saveButton).toBeDisabled();
  });

  it('shows loading text during update', async () => {
    const user = userEvent.setup();
    vi.mocked(programApi.update).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(undefined), 100))
    );

    render(
      <EditProgramDialog
        open={true}
        program={mockProgram}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/program name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });

  it('handles null end date correctly', async () => {
    const user = userEvent.setup();
    const programWithoutEndDate: Program = {
      ...mockProgram,
      endDate: null
    };
    vi.mocked(programApi.update).mockResolvedValue(undefined);

    render(
      <EditProgramDialog
        open={true}
        program={programWithoutEndDate}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByLabelText(/end date/i)).toHaveValue('');

    const nameInput = screen.getByLabelText(/program name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(programApi.update).toHaveBeenCalledWith(1, expect.objectContaining({
        name: 'Updated Name',
        endDate: null
      }));
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();

    render(
      <EditProgramDialog
        open={true}
        program={mockProgram}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/program name/i);
    await user.clear(nameInput);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });
});
