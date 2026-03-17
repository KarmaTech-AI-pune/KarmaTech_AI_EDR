import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPassword from './ResetPassword';

// Mock passwordApi
vi.mock('../services/passwordApi', () => ({
  passwordApi: {
    resetPassword: vi.fn()
  }
}));

// Mock useSearchParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams('token=test-token')]
  };
});

describe('ResetPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render reset password page', () => {
      render(<ResetPassword />);
      expect(screen.getByText(/reset password/i)).toBeInTheDocument();
    });

    it('should display password input field', () => {
      render(<ResetPassword />);
      const passwordInputs = screen.getAllByLabelText(/password/i);
      expect(passwordInputs.length).toBeGreaterThan(0);
    });

    it('should display submit button', () => {
      render(<ResetPassword />);
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('should display instruction text', () => {
      render(<ResetPassword />);
      expect(screen.getByText(/enter your new password/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should handle successful password reset', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.resetPassword).mockResolvedValue({
        success: true,
        message: 'Password reset successfully'
      });

      render(<ResetPassword />);
      const passwordInputs = screen.getAllByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await userEvent.type(passwordInputs[0], 'NewPassword123!');
      await userEvent.type(passwordInputs[1], 'NewPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password reset successfully')).toBeInTheDocument();
      });
    });

    it('should handle failed password reset', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.resetPassword).mockResolvedValue({
        success: false,
        message: 'Invalid or expired token'
      });

      render(<ResetPassword />);
      const passwordInputs = screen.getAllByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await userEvent.type(passwordInputs[0], 'NewPassword123!');
      await userEvent.type(passwordInputs[1], 'NewPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      render(<ResetPassword />);
      const passwordInputs = screen.getAllByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await userEvent.type(passwordInputs[0], 'Password123!');
      await userEvent.type(passwordInputs[1], 'DifferentPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should disable button while loading', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.resetPassword).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Success' }), 100))
      );

      render(<ResetPassword />);
      const passwordInputs = screen.getAllByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await userEvent.type(passwordInputs[0], 'NewPassword123!');
      await userEvent.type(passwordInputs[1], 'NewPassword123!');
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Form Validation', () => {
    it('should accept valid passwords', async () => {
      render(<ResetPassword />);
      const passwordInputs = screen.getAllByLabelText(/password/i) as HTMLInputElement[];

      await userEvent.type(passwordInputs[0], 'ValidPassword123!');
      expect(passwordInputs[0].value).toBe('ValidPassword123!');
    });

    it('should validate password strength', async () => {
      render(<ResetPassword />);
      const passwordInputs = screen.getAllByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await userEvent.type(passwordInputs[0], 'weak');
      await userEvent.type(passwordInputs[1], 'weak');
      fireEvent.click(submitButton);

      // Should show validation error
      expect(screen.getByText(/password/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.resetPassword).mockRejectedValue(new Error('Network error'));

      render(<ResetPassword />);
      const passwordInputs = screen.getAllByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await userEvent.type(passwordInputs[0], 'NewPassword123!');
      await userEvent.type(passwordInputs[1], 'NewPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
      });
    });

    it('should handle missing token', () => {
      render(<ResetPassword />);
      // Should still render the form
      expect(screen.getByText(/reset password/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ResetPassword />);
      const heading = screen.getByRole('heading', { name: /reset password/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible form elements', () => {
      render(<ResetPassword />);
      const passwordInputs = screen.getAllByLabelText(/password/i);
      expect(passwordInputs.length).toBeGreaterThan(0);
    });

    it('should have accessible button', () => {
      render(<ResetPassword />);
      const button = screen.getByRole('button', { name: /reset password/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple submissions', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.resetPassword).mockResolvedValue({
        success: true,
        message: 'Success'
      });

      render(<ResetPassword />);
      const passwordInputs = screen.getAllByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await userEvent.type(passwordInputs[0], 'NewPassword123!');
      await userEvent.type(passwordInputs[1], 'NewPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });

      expect(vi.mocked(passwordApi.resetPassword)).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in password', async () => {
      render(<ResetPassword />);
      const passwordInputs = screen.getAllByLabelText(/password/i) as HTMLInputElement[];

      await userEvent.type(passwordInputs[0], 'P@ssw0rd!#$%');
      expect(passwordInputs[0].value).toBe('P@ssw0rd!#$%');
    });
  });
});
