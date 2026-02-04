import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Link,
  createTheme,
  ThemeProvider,
  CircularProgress,
} from '@mui/material';
import NotificationSnackbar from '../components/widgets/NotificationSnackbar';
import FormField from '../components/forms/FormField';
import { VersionDisplay } from '../components/VersionDisplay';
import { signupSchema } from '../schemas/signupSchema';
import { z } from 'zod';
import { authApi } from '../services/authApi';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType } from '../types';

type SignupFormValues = z.infer<typeof signupSchema>;

const subscriptionPlanOptions = [
  { value: 'Starter', label: 'Starter' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Enterprises', label: 'Enterprises' },
];

const theme = createTheme({
  palette: {
    primary: {
      main: '#1869DA', // Blue color from textFieldStyle
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent uppercase button text
        },
      },
    },
  },
});

const Signup: React.FC = () => {
  const methods = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      companyName: '',
      companyAddress: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      emailAddress: '',
      subdomain: '',
      subscriptionPlan: 'Starter',
    },
    mode: 'all',
  });

  const { handleSubmit, reset } = methods;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const { isAuthenticated } = useContext(projectManagementAppContext) as projectManagementAppContextType;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: data.emailAddress,
        phoneNumber: data.phoneNumber,
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        subdomain: data.subdomain,
        subscriptionPlan: data.subscriptionPlan,
      };

      const result = await authApi.signup(payload);

      if (result.success) {
        setSnackbarMessage(result.message || 'Account created successfully! Redirecting to login...');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        reset(); // Clear the form
        setTimeout(() => {
          navigate('/login'); // Redirect to login page
        }, 2000);
      } else {
        setSnackbarMessage(result.message || 'Account creation failed. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      // This catch block will primarily handle unexpected errors not caught by authApi.signup
      console.error('Signup error:', error);
      setSnackbarMessage('An unexpected error occurred during signup.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f0f2f5', // Light grey background
          padding: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
          <img src="/KarmaTech_logo.png" alt="KarmaTech AI Logo" style={{ width: '80px', height: '80px', marginBottom: '16px' }} />
          <Typography variant="h4" component="h1" sx={{ color: '#1869DA', fontWeight: 'bold', marginBottom: 1 }}>
            KarmaTech-AI EDR(Enterprise Digital Runner)
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
          <VersionDisplay
            variant="subtitle1"
            color="textSecondary"
            showBuildDate={false}
            showDevIndicator={false}
            fetchVersionFromAPI={false}
          />
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 2,
            width: '100%',
            maxWidth: '500px',
            boxSizing: 'border-box ',
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', marginBottom: 1, textAlign: 'center' }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 3 , textAlign: 'center'}}>
            Join thousands of professionals using  EDR enterprise digital runner
          </Typography>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormField name="companyName" label="Company Name" placeholder="Enter your company name" />
                </Grid>
                <Grid item xs={12}>
                  <FormField name="companyAddress" label="Company Address" placeholder="Enter your company address" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField name="firstName" label="First Name" placeholder="John" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField name="lastName" label="Last Name" placeholder="Doe" />
                </Grid>
                <Grid item xs={12}>
                  <FormField name="phoneNumber" label="Phone Number" placeholder="9012345678" />
                </Grid>
                <Grid item xs={12}>
                  <FormField name="emailAddress" label="Email Address" type="email" placeholder="john@company.com" />
                </Grid>
                <Grid item xs={12}>
                  <FormField
                    name="subdomain"
                    label="Choose Your Subdomain"
                    placeholder="yourcompany"
                    endAdornment=".karmaTechAi.com"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormField
                    name="subscriptionPlan"
                    label="Subscription Plan"
                    selectOptions={subscriptionPlanOptions}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ paddingY: 1.5, fontWeight: 'bold' }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </FormProvider>

          <Box sx={{ textAlign: 'center', marginTop: 3 }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{' '}
              <Link href="/login" sx={{ color: '#1869DA', textDecoration: 'none' }}>
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
      <NotificationSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </ThemeProvider>
  );
};

export default Signup;
