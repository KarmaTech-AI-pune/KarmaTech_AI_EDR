import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OTPVerification } from './OTPVerification';
import { twoFactorApi } from '../services/twoFactorApi';

vi.mock('../services/twoFactorApi', () => ({
  twoFactorApi: {
    verifyOtp: vi.fn(),
    sendOtp: vi.fn(),
  }
}));

describe('OTPVerification Component', () => {
  const mockEmail = 'user@example.com';
  const mockOnSuccess = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders OTP form correctly', () => {
    render(
      <OTPVerification 
        email={mockEmail} 
        onVerificationSuccess={mockOnSuccess} 
        onBackToLogin={mockOnBack} 
      />
    );

    expect(screen.getByText('Verify OTP')).toBeInTheDocument();
    expect(screen.getByText(mockEmail)).toBeInTheDocument();
    expect(screen.getByLabelText('Enter OTP Code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify & Login' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Resend OTP' })).toBeDisabled();
  });

  it('enables Verify button when 6 digits are entered', () => {
    render(
      <OTPVerification 
        email={mockEmail} 
        onVerificationSuccess={mockOnSuccess} 
        onBackToLogin={mockOnBack} 
      />
    );

    const input = screen.getByLabelText('Enter OTP Code');
    fireEvent.change(input, { target: { value: '123456' } });

    expect(screen.getByRole('button', { name: 'Verify & Login' })).not.toBeDisabled();
  });

  it('calls verify API and onVerificationSuccess on valid code', async () => {
    vi.mocked(twoFactorApi.verifyOtp).mockResolvedValueOnce({ success: true } as any);

    render(
      <OTPVerification 
        email={mockEmail} 
        onVerificationSuccess={mockOnSuccess} 
        onBackToLogin={mockOnBack} 
      />
    );

    const input = screen.getByLabelText('Enter OTP Code');
    fireEvent.change(input, { target: { value: '123456' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Verify & Login' }));

    await waitFor(() => {
      expect(twoFactorApi.verifyOtp).toHaveBeenCalledWith(mockEmail, '123456');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('shows error if API validation fails', async () => {
    vi.mocked(twoFactorApi.verifyOtp).mockResolvedValueOnce({ 
      success: false, 
      message: 'Invalid code provided' 
    } as any);

    render(
      <OTPVerification 
        email={mockEmail} 
        onVerificationSuccess={mockOnSuccess} 
        onBackToLogin={mockOnBack} 
      />
    );

    const input = screen.getByLabelText('Enter OTP Code');
    fireEvent.change(input, { target: { value: '123456' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Verify & Login' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid code provided')).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('calls onBackToLogin when back button is clicked', () => {
    render(
      <OTPVerification 
        email={mockEmail} 
        onVerificationSuccess={mockOnSuccess} 
        onBackToLogin={mockOnBack} 
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back to Login' }));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
