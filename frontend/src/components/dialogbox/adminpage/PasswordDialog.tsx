import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AuthUser } from '../../../models/userModel';
import { passwordApi } from '../../../services/passwordApi';

interface PasswordDialogProps {
  open: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onSuccess: () => void;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({
  open,
  onClose,
  user,
  onSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setError('');
      
      if (!newPassword || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Validate password strength
      const validation = passwordApi.validatePassword(newPassword);
      if (!validation.isValid) {
        setError(validation.errors.join('. '));
        return;
      }

      setIsLoading(true);
      debugger;
      // Call the API to reset password
      const result = await passwordApi.adminResetUserPassword(user?.email || '', newPassword);

      if (result.success) {
        onSuccess();
        handleClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update password. Please try again.');
      console.error('Password update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reset Password for {user.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* User Info Section */}
          <Stack spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Username"
              value={user.userName}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Email"
              value={user.email}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Stack>

          {/* Password Section */}
          <Stack spacing={2}>
            <TextField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Reset Password'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordDialog;
