import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Typography,
  Divider,
  Collapse,
  Paper
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Close
} from '@mui/icons-material';
import { passwordApi } from '../../services/passwordApi';

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordChangeDropdownProps {
  onClose: () => void;
}

export const PasswordChangeDropdown: React.FC<PasswordChangeDropdownProps> = ({ onClose }) => {
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handlePasswordChange = (field: keyof PasswordChangeData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password: string): string[] => {
    const validation = passwordApi.validatePassword(password);
    return validation.errors;
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setPasswordError(passwordErrors.join('. '));
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await passwordApi.changePassword({
        currentPassword,
        newPassword
      });

      if (result.success) {
        setPasswordSuccess(result.message);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Auto-close after 3 seconds on success
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setPasswordError(result.message);
      }
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordSuccess('');
    onClose();
  };

  const handleShowForm = () => {
    setShowForm(true);
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        top: '100%',
        right: 0,
        mt: 1,
        minWidth: 320,
        maxWidth: 400,
        zIndex: 1300,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Lock color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Change Password</Typography>
          </Box>
          <IconButton size="small" onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Show Form Button */}
        {!showForm && (
          <Box>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Lock />}
              onClick={handleShowForm}
              sx={{ mb: 2 }}
            >
              Change Password
            </Button>
            <Typography variant="body2" color="text.secondary" align="center">
              Click to change your password
            </Typography>
          </Box>
        )}

        {/* Password Change Form */}
        <Collapse in={showForm}>
          <Box>
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}

            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {passwordSuccess}
              </Alert>
            )}

            <Box component="form" onSubmit={handlePasswordSubmit}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
                margin="dense"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                        size="small"
                      >
                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange('newPassword')}
                margin="dense"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                        size="small"
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                margin="dense"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                        size="small"
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isChangingPassword}
                  startIcon={isChangingPassword ? <CircularProgress size={16} /> : <Lock />}
                  sx={{ flex: 1 }}
                  size="small"
                >
                  {isChangingPassword ? 'Changing...' : 'Change'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowForm(false)}
                  disabled={isChangingPassword}
                  size="small"
                >
                  Cancel
                </Button>
              </Box>
            </Box>

            {/* Password Requirements */}
            <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Password must contain:
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • At least 8 characters
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Uppercase and lowercase letters
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Numbers and special characters
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
};

export default PasswordChangeDropdown;
