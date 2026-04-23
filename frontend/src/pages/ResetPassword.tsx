import React, { useState, useEffect } from 'react';
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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { passwordApi } from '../services/passwordApi';
import { useDomainBranding } from '../hooks/useDomainBranding';

export const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { logoUrl, tenantName } = useDomainBranding();

    // Get token and email from URL parameters
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setError('Invalid reset password link');
        }
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            if (!token || !email) {
                setError('Invalid reset password link');
                return;
            }

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

            const result = await passwordApi.resetPassword(token, newPassword, email);
            
            if (result.success) {
                setSuccess(result.message);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Reset password error:', err);
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
                        src={logoUrl}
                        alt={tenantName || "KarmaTech AI Logo"}
                        style={{
                            maxWidth: '150px',
                            maxHeight: '150px',
                            marginBottom: '0.5rem',
                            objectFit: 'contain'
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
                    Reset Your Password
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
                        Enter your new password below.
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="New Password"
                            variant="outlined"
                            margin="normal"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            variant="outlined"
                            margin="normal"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            sx={{
                                mb: 3,
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
                            disabled={isLoading || !token || !email}
                            sx={{
                                mt: 2,
                                mb: 2,
                                py: 1.5,
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '1.1rem'
                            }}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
