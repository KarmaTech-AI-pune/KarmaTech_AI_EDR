import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Alert,
  Switch,
  FormControlLabel,
  Avatar,
  Grid,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security,
  Lock,
  Business,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType } from '../types';
import { twoFactorApi } from '../services/twoFactorApi';
import { passwordApi } from '../services/passwordApi';
import { authApi } from '../services/authApi';
import { de } from 'date-fns/locale';

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserProfileState {
  passwordData: PasswordChangeData;
  showPasswords: {
    current: boolean;
    new: boolean;
    confirm: boolean;
  };
  isChangingPassword: boolean;
  passwordError: string;
  passwordSuccess: string;
  twoFactorEnabled: boolean;
  isLoadingTwoFactorStatus: boolean;
  isToggling2FA: boolean;
  twoFactorError: string;
  twoFactorSuccess: string;
  show2FADialog: boolean;
  twoFactorAction: 'enable' | 'disable' | null;
}

export const UserProfile: React.FC = () => {
  const { user } = useContext(projectManagementAppContext) as projectManagementAppContextType;
  const navigate = useNavigate();
  
  const [state, setState] = useState<UserProfileState>({
    passwordData: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    showPasswords: {
      current: false,
      new: false,
      confirm: false
    },
    isChangingPassword: false,
    passwordError: '',
    passwordSuccess: '',
    twoFactorEnabled: false,
    isLoadingTwoFactorStatus: true,
    isToggling2FA: false,
    twoFactorError: '',
    twoFactorSuccess: '',
    show2FADialog: false,
    twoFactorAction: null
  });

  useEffect(() => {
    // Seed initial UI from user object while status loads
    console.log('User object in UserProfile:', user);
    debugger;
    if (user) {
      setState(prev => ({
        ...prev,
        twoFactorEnabled: user?.twoFactorEnabled || false,
        isLoadingTwoFactorStatus: true
      }));
    }
  }, []);

  // Deep link support: if query param section=2fa, scroll to 2FA card
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section === '2fa') {
      const el = document.getElementById('two-factor-section');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.search]);

  // Fetch actual 2FA status from backend; fall back to user object on failure
  useEffect(() => {
    debugger;
    const fetch2FAStatus = async () => {
      //if (!user) return;
      try {
        const res = await twoFactorApi.getTwoFactorStatus(user?.id);
        if (res.success) {
          setState(prev => ({ ...prev, twoFactorEnabled: res.enabled }));
        } else {
          setState(prev => ({ ...prev, twoFactorEnabled: res.enabled || false }));
        }
      } finally {
        setState(prev => ({ ...prev, isLoadingTwoFactorStatus: false }));
      }
    };
    fetch2FAStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handlePasswordChange = (field: keyof PasswordChangeData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState(prev => ({
      ...prev,
      passwordData: {
        ...prev.passwordData,
        [field]: event.target.value
      },
      passwordError: '',
      passwordSuccess: ''
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof state.showPasswords) => {
    setState(prev => ({
      ...prev,
      showPasswords: {
        ...prev.showPasswords,
        [field]: !prev.showPasswords[field]
      }
    }));
  };

  const validatePassword = (password: string): string[] => {
    const validation = passwordApi.validatePassword(password);
    return validation.errors;
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState(prev => ({ ...prev, passwordError: '', passwordSuccess: '' }));

    const { currentPassword, newPassword, confirmPassword } = state.passwordData;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setState(prev => ({ ...prev, passwordError: 'All fields are required' }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setState(prev => ({ ...prev, passwordError: 'New passwords do not match' }));
      return;
    }

    if (currentPassword === newPassword) {
      setState(prev => ({ ...prev, passwordError: 'New password must be different from current password' }));
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setState(prev => ({ ...prev, passwordError: passwordErrors.join('. ') }));
      return;
    }

    setState(prev => ({ ...prev, isChangingPassword: true }));

    try {
      // Optional: prevent reuse of a recent password
      const historyCheck = await passwordApi.checkPasswordHistory(newPassword);
      if (historyCheck.isRecent) {
        setState(prev => ({
          ...prev,
          isChangingPassword: false,
          passwordError: historyCheck.message || 'New password was used recently. Choose a different password.'
        }));
        return;
      }

      const result = await passwordApi.changePassword({
        currentPassword,
        newPassword
      });

      if (result.success) {
        setState(prev => ({
          ...prev,
          passwordSuccess: result.message || 'Password changed successfully. Redirecting to login...',
          passwordData: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }));

        // For security, log the user out and navigate to login
        try {
          await authApi.logout();
        } catch {
          // ignore
        }
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      } else {
        setState(prev => ({
          ...prev,
          passwordError: result.message
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        passwordError: error.message || 'Failed to change password. Please try again.'
      }));
    } finally {
      setState(prev => ({ ...prev, isChangingPassword: false }));
    }
  };

  const handle2FAToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setState(prev => ({
      ...prev,
      show2FADialog: true,
      twoFactorAction: enabled ? 'enable' : 'disable'
    }));
  };

  const handle2FAAction = async () => {
    if (!user || !state.twoFactorAction) return;

    setState(prev => ({ ...prev, isToggling2FA: true, twoFactorError: '', twoFactorSuccess: '' }));

    try {
      let result;
      if (state.twoFactorAction === 'enable') {
        result = await twoFactorApi.enableTwoFactor(user.id);
      } else {
        result = await twoFactorApi.disableTwoFactor(user.id);
      }

      if (result.success) {
        setState(prev => ({
          ...prev,
          twoFactorEnabled: state.twoFactorAction === 'enable',
          twoFactorSuccess: result.message,
          show2FADialog: false,
          twoFactorAction: null
        }));
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.twoFactorEnabled = state.twoFactorAction === 'enable';
            localStorage.setItem('user', JSON.stringify(parsed));
          }
        } catch {}
      } else {
        setState(prev => ({
          ...prev,
          twoFactorError: result.message,
          show2FADialog: false,
          twoFactorAction: null
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        twoFactorError: error.message || 'Failed to update 2FA settings',
        show2FADialog: false,
        twoFactorAction: null
      }));
    } finally {
      setState(prev => ({ ...prev, isToggling2FA: false }));
    }
  };

  const handle2FADialogClose = () => {
    setState(prev => ({
      ...prev,
      show2FADialog: false,
      twoFactorAction: null
    }));
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">User not found. Please log in again.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and security preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* User Information Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {user.name?.charAt(0).toUpperCase() || user.userName?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {user.name || user.userName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              {user.roles && user.roles.length > 0 && (
                <Chip
                  label={user.roles[0].name}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
              {(user as any).tenantDomain && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    <Business sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    {(user as any).tenantDomain}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Settings Cards */}
        <Grid item xs={12} md={8}>
          {/* Password Change Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Lock color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Change Password</Typography>
              </Box>

              {state.passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {state.passwordError}
                </Alert>
              )}

              {state.passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {state.passwordSuccess}
                </Alert>
              )}

              <Box component="form" onSubmit={handlePasswordSubmit}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type={state.showPasswords.current ? 'text' : 'password'}
                  value={state.passwordData.currentPassword}
                  onChange={handlePasswordChange('currentPassword')}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('current')}
                          edge="end"
                        >
                          {state.showPasswords.current ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  label="New Password"
                  type={state.showPasswords.new ? 'text' : 'password'}
                  value={state.passwordData.newPassword}
                  onChange={handlePasswordChange('newPassword')}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('new')}
                          edge="end"
                        >
                          {state.showPasswords.new ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={state.showPasswords.confirm ? 'text' : 'password'}
                  value={state.passwordData.confirmPassword}
                  onChange={handlePasswordChange('confirmPassword')}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('confirm')}
                          edge="end"
                        >
                          {state.showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={state.isChangingPassword}
                    startIcon={state.isChangingPassword ? <CircularProgress size={20} /> : <Lock />}
                  >
                    {state.isChangingPassword ? 'Changing Password...' : 'Change Password'}
                  </Button>
                  <Button
                    component={Link}
                    to="/change-password"
                    variant="outlined"
                    startIcon={<Lock />}
                  >
                    Open Password Page
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication Card */}
          <Card id="two-factor-section">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Security color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Two-Factor Authentication</Typography>
              </Box>

              {state.twoFactorError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {state.twoFactorError}
                </Alert>
              )}

              {state.twoFactorSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {state.twoFactorSuccess}
                </Alert>
              )}

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: state.isLoadingTwoFactorStatus
                    ? 'grey.50'
                    : state.twoFactorEnabled ? 'success.50' : 'warning.50',
                  borderColor: state.isLoadingTwoFactorStatus
                    ? 'grey.300'
                    : state.twoFactorEnabled ? 'success.main' : 'warning.main'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {state.isLoadingTwoFactorStatus ? null : state.twoFactorEnabled ? (
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                  ) : (
                    <Warning color="warning" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="subtitle1" fontWeight="medium">
                    {state.isLoadingTwoFactorStatus
                      ? 'Checking 2FA status...'
                      : state.twoFactorEnabled ? '2FA is Enabled' : '2FA is Disabled'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {state.isLoadingTwoFactorStatus
                    ? 'Please wait while we retrieve your current 2FA status.'
                    : state.twoFactorEnabled
                      ? 'Your account is protected with two-factor authentication. You will receive an OTP code via email when logging in.'
                      : 'Enable two-factor authentication to add an extra layer of security to your account.'}
                </Typography>
              </Paper>

              <FormControlLabel
                control={
                  <Switch
                    checked={state.twoFactorEnabled}
                    onChange={handle2FAToggle}
                    disabled={state.isToggling2FA || state.isLoadingTwoFactorStatus}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">
                      {state.isLoadingTwoFactorStatus
                        ? 'Loading...'
                        : state.twoFactorEnabled ? 'Enable 2FA':'Disable 2FA'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {state.isLoadingTwoFactorStatus
                        ? 'Fetching status from server'
                        : state.twoFactorEnabled
                          ? 'Turn off two-factor authentication'
                          : 'Turn on two-factor authentication for enhanced security'}
                    </Typography>
                  </Box>
                }
              />

              {state.isToggling2FA && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Updating 2FA settings...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 2FA Confirmation Dialog */}
      <Dialog
        open={state.show2FADialog}
        onClose={handle2FADialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {state.twoFactorAction === 'enable' ? 'Enable Two-Factor Authentication' : 'Disable Two-Factor Authentication'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {state.twoFactorAction === 'enable' ? (
              <>
                You are about to enable two-factor authentication for your account. This will add an extra layer of security by requiring a verification code sent to your email address each time you log in.
                <br /><br />
                <strong>Are you sure you want to enable 2FA?</strong>
              </>
            ) : (
              <>
                You are about to disable two-factor authentication for your account. This will remove the extra security layer and allow you to log in with just your password.
                <br /><br />
                <strong>Are you sure you want to disable 2FA?</strong>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handle2FADialogClose} disabled={state.isToggling2FA}>
            Cancel
          </Button>
          <Button
            onClick={handle2FAAction}
            variant="contained"
            color={state.twoFactorAction === 'enable' ? 'success' : 'warning'}
            disabled={state.isToggling2FA}
            startIcon={state.isToggling2FA ? <CircularProgress size={20} /> : undefined}
          >
            {state.isToggling2FA
              ? 'Processing...'
              : state.twoFactorAction === 'enable'
              ? 'Enable 2FA'
              : 'Disable 2FA'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;
