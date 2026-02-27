import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PasswordDialog from './PasswordDialog';
import { passwordApi } from '../../../services/passwordApi';

vi.mock('../../../services/passwordApi', () => ({
  passwordApi: {
    validatePassword: vi.fn(),
    adminResetUserPassword: vi.fn(),
  }
}));

describe('PasswordDialog Component', () => {
  const mockUser: any = {
    id: 1,
    userName: 'johndoe',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'User',
    roles: [],
    password: '',
    standardRate: 0,
    isConsultant: false,
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with given user data provided', () => {
    render(
      <PasswordDialog 
        open={true} 
        onClose={vi.fn()} 
        user={mockUser} 
        onSuccess={vi.fn()} 
      />
    );

    expect(screen.getByText('Reset Password for John Doe')).toBeInTheDocument();
    
    // Check that read-only username/email fields are populated
    const usernameInput = screen.getByLabelText(/Username/i);
    expect(usernameInput).toHaveValue('johndoe');
    expect(usernameInput).toHaveAttribute('readonly');

    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toHaveValue('john@example.com');
    expect(emailInput).toHaveAttribute('readonly');
  });

  it('displays error when passwords do not match', async () => {
    render(
      <PasswordDialog 
        open={true} 
        onClose={vi.fn()} 
        user={mockUser} 
        onSuccess={vi.fn()} 
      />
    );

    fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: 'Secret123!' } });
    fireEvent.change(screen.getByLabelText(/^Confirm New Password/i), { target: { value: 'WrongSecret!' } });
    
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('displays error when passwordApi validation fails', async () => {
    (passwordApi.validatePassword as any).mockReturnValue({
      isValid: false,
      errors: ['Password needs a special character']
    });

    render(
      <PasswordDialog 
        open={true} 
        onClose={vi.fn()} 
        user={mockUser} 
        onSuccess={vi.fn()} 
      />
    );

    fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: 'weakpass' } });
    fireEvent.change(screen.getByLabelText(/^Confirm New Password/i), { target: { value: 'weakpass' } });
    
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(screen.getByText('Password needs a special character')).toBeInTheDocument();
  });

  it('submits correctly mapping admin reset API on success', async () => {
    const mockOnSuccess = vi.fn();
    const mockOnClose = vi.fn();

    (passwordApi.validatePassword as any).mockReturnValue({
      isValid: true,
      errors: []
    });
    
    (passwordApi.adminResetUserPassword as any).mockResolvedValue({
      success: true,
      message: 'Password reset successful'
    });

    render(
      <PasswordDialog 
        open={true} 
        onClose={mockOnClose} 
        user={mockUser} 
        onSuccess={mockOnSuccess} 
      />
    );

    fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: 'StrongPass123!@#' } });
    fireEvent.change(screen.getByLabelText(/^Confirm New Password/i), { target: { value: 'StrongPass123!@#' } });
    
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(passwordApi.adminResetUserPassword).toHaveBeenCalledWith('john@example.com', 'StrongPass123!@#');
      expect(mockOnSuccess).toHaveBeenCalled();
      // handleClose triggers onClose
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
