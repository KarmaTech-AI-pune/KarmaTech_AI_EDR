import React, { useState } from 'react';
import {
    TextField,
    Button,
    Card,
    CardContent,
    Typography,
    Box,
    Alert,
    Container,
    Link
} from '@mui/material';
import { passwordApi } from '../services/passwordApi';

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            if (!email) {
                setError('Email is required');
                return;
            }

            const result = await passwordApi.sendPasswordResetEmail(email);
            
            if (result.success) {
                setSuccess(result.message);
                // Clear the form
                setEmail('');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Forgot password error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor="#f5f5f5"
            padding={3}
        >
            <Container maxWidth="sm" sx={{ textAlign: 'center', mb: 2 }}>
                <Box sx={{ mb: 1 }}>
                    <img
                        src="/KarmaTech_logo.png"
                        alt="KarmaTech AI"
                        style={{
                            maxWidth: '150px',
                            maxHeight: '150px',
                            marginBottom: '0.5rem'
                        }}
                    />
                </Box>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        mb: 1,
                        fontWeight: 'bold',
                        color: '#1976d2'
                    }}
                >
                    Reset Password
                </Typography>
            </Container>

            <Card
                sx={{
                    maxWidth: 450,
                    width: '100%',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    borderRadius: 2
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="body1" align="center" gutterBottom sx={{ mb: 3 }}>
                        Enter your email address and we'll send you instructions to reset your password.
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            margin="normal"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={isLoading}
                            sx={{
                                mt: 2,
                                mb: 2,
                                py: 1.5,
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '1.1rem'
                            }}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                        </Button>
                    </form>
                    <Typography variant="body2" align="center" sx={{ mt: 2, color: '#666' }}>
                        <Link 
                            href="/login" 
                            sx={{ 
                                color: '#1976d2', 
                                textDecoration: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Back to Login
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
            
            {error && (
                <Alert
                    severity="error"
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        maxWidth: 300,
                        boxShadow: 2
                    }}
                >
                    {error}
                </Alert>
            )}
            
            {success && (
                <Alert
                    severity="success"
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        maxWidth: 300,
                        boxShadow: 2
                    }}
                >
                    {success}
                </Alert>
            )}
        </Box>
    );
};

export default ForgotPassword;
