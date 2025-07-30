import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Link,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import FormField from '../components/forms/FormField';
import { signupSchema } from '../schemas/signupSchema';
import { z } from 'zod';

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

  const { handleSubmit } = methods;

  const onSubmit = (data: SignupFormValues) => {
    console.log(data);
    // Here you would typically send the data to your backend API
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
          <img src="/KarmaTech_logo.jpg" alt="KarmaTech AI Logo" style={{ width: '80px', height: '80px', marginBottom: '16px' }} />
          <Typography variant="h4" component="h1" sx={{ color: '#1869DA', fontWeight: 'bold', marginBottom: 1 }}>
            KarmaTech AI Project Management Application
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Version 1.11.11
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 2,
            width: '100%',
            maxWidth: '500px',
            boxSizing: 'border-box',
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', marginBottom: 1, textAlign: 'center' }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 3 , textAlign: 'center'}}>
            Join thousands of professionals already using EDR
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
                  >
                    Create Account
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
    </ThemeProvider>
  );
};

export default Signup;
