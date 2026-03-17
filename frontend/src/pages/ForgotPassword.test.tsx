import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPassword from './ForgotPassword';

// Mock passwordApi
vi.mock('../services/passwordApi', () => ({
  passwordApi: {
    sendPasswordResetEmail: vi.fn()
  }
}));

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render forgot password page', () => {
      render(<ForgotPassword />);
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
    });

    it('should display email input field', () => {
      render(<ForgotPassword />);
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });

    it('should display submit button', () => {
      render(<ForgotPassword />);
      expect(screen.getByRole('button', { name: /Send Reset Instructions/i })).toBeInTheDocument();
    });

    it('should display back to login link', () => {
      render(<ForgotPassword />);
      expect(screen.getByText('Back to Login')).toBeInTheDocument();
    });

    it('should display instruction text', () => {
      render(<ForgotPassword />);
      expect(screen.getByText(/Enter your email address and we'll send you instructions/i)).toBeInTheDocument();
    });

    it('should render logo image', () => {
      render(<ForgotPassword />);
      const logo = screen.getByAltText('KarmaTech AI');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should handle successful password reset', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.sendPasswordResetEmail).mockResolvedValue({
        success: true,
        message: 'Reset instructions sent to your email'
      });

      render(<ForgotPassword />);
      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Send Reset Instructions/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Reset instructions sent to your email')).toBeInTheDocument();
      });
    });

    it('should handle failed password reset', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.sendPasswordResetEmail).mockResolvedValue({
        success: false,
        message: 'Email not found'
      });

      render(<ForgotPassword />);
      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Send Reset Instructions/i });

      await userEvent.type(emailInput, 'nonexistent@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email not found')).toBeInTheDocument();
      });
    });

    it('should show error when email is empty', async () => {
      render(<ForgotPassword />);
      const submitButton = screen.getByRole('button', { name: /Send Reset Instructions/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should disable button while loading', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.sendPasswordResetEmail).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Sent' }), 100))
      );

      render(<ForgotPassword />);
      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Send Reset Instructions/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should show loading text while submitting', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.sendPasswordResetEmail).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Sent' }), 100))
      );

      render(<ForgotPassword />);
      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Send Reset Instructions/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitButton);

      expect(screen.getByRole('button', { name: /Sending/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should accept valid email', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.sendPasswordResetEmail).mockResolvedValue({
        success: true,
        message: 'Email sent'
      });

      render(<ForgotPassword />);
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;

      await userEvent.type(emailInput, 'valid@example.com');
      expect(emailInput.value).toBe('valid@example.com');
    });

    it('should clear form after successful submission', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.sendPasswordResetEmail).mockResolvedValue({
        success: true,
        message: 'Email sent'
      });

      render(<ForgotPassword />);
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /Send Reset Instructions/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInput.value).toBe('');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.sendPasswordResetEmail).mockRejectedValue(new Error('Network error'));

      render(<ForgotPassword />);
      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Send Reset Instructions/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
      });
    });

    it('should clear previous errors on new submission', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.sendPasswordResetEmail)
        .mockResolvedValueOnce({ success: false, message: 'Error 1' })
        .mockResolvedValueOnce({ success: true, message: 'Success' });

      render(<ForgotPassword />);
      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Send Reset Instructions/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error 1')).toBeInTheDocument();
      });

      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'test2@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Error 1')).not.toBeInTheDocument();
        expect(screen.getByText('Success')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ForgotPassword />);
      const heading = screen.getByRole('heading', { name: /Reset Password/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible form elements', () => {
      render(<ForgotPassword />);
      const emailInput = screen.getByLabelText(/Email/i);
      expect(emailInput).toBeInTheDocument();
    });

    it('should have accessible button', () => {
      render(<ForgotPassword />);
      const button = screen.getByRole('button', { name: /Send Reset Instructions/i });
      expect(button).toBeInTheDocument();
    });

    it('should have accessible link', () => {
      render(<ForgotPassword />);
      const link = screen.getByText('Back to Login');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have back to login link', () => {
      render(<ForgotPassword />);
      const link = screen.getByText('Back to Login') as HTMLAnchorElement;
      expect(link.href).toContain('/login');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple submissions', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.sendPasswordResetEmail).mockResolvedValue({
        success: true,
        message: 'Email sent'
      });

      render(<ForgotPassword />);
      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Send Reset Instructions/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email sent')).toBeInTheDocument();
      });

      await userEvent.type(emailInput, 'test2@example.com');
      fireEvent.click(submitButton);

      expect(vi.mocked(passwordApi.sendPasswordResetEmail)).toHaveBeenCalledTimes(2);
    });

    it('should handle special characters in email', async () => {
      const { passwordApi } = await import('../services/passwordApi');
      vi.mocked(passwordApi.sendPasswordResetEmail).mockResolvedValue({
        success: true,
        message: 'Email sent'
      });

      render(<ForgotPassword />);
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;

      await userEvent.type(emailInput, 'test+tag@example.com');
      expect(emailInput.value).toBe('test+tag@example.com');
    });
  });
});
