import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
  CircularProgress
} from '@mui/material';
import { twoFactorApi, TwoFactorResponse } from '../services/twoFactorApi';

interface OTPVerificationProps {
  email: string;
  onVerificationSuccess: (response: TwoFactorResponse) => void;
  onBackToLogin: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onVerificationSuccess,
  onBackToLogin
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      setIsLoading(false);
      return;
    }

    try {
      const result = await twoFactorApi.verifyOtp(email, otpCode);
      
      if (result.success) {
        onVerificationSuccess(result);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);
    setCanResend(false);
    setTimeLeft(300);

    try {
      const result = await twoFactorApi.sendOtp(email);
      
      if (result.success) {
        setError(''); // Clear any previous errors
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Verify OTP
            </Typography>
            
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              We've sent a 6-digit verification code to:
              <br />
              <strong>{email}</strong>
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleVerifyOTP}>
              <TextField
                fullWidth
                label="Enter OTP Code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputProps={{
                  maxLength: 6,
                  pattern: '[0-9]*',
                  inputMode: 'numeric'
                }}
                sx={{ mb: 2 }}
                autoFocus
              />

              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                Time remaining: <strong>{formatTime(timeLeft)}</strong>
              </Typography>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || !otpCode || otpCode.length !== 6}
                sx={{ mb: 2 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Verify & Login'}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleResendOTP}
                disabled={!canResend || isLoading}
                sx={{ mb: 2 }}
              >
                Resend OTP
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={onBackToLogin}
                disabled={isLoading}
              >
                Back to Login
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 2, display: 'block' }}>
              Didn't receive the code? Check your spam folder or contact support.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};




