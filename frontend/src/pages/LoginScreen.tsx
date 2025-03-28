import { useState, useContext  } from 'react'
import { 
    TextField, 
    Button, 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Alert,
    Container
} from '@mui/material';
import { authApi } from '../services/authApi';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType, Credentials } from '../types';

export const LoginScreen: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setScreenState, setIsAuthenticated, setUser } = useContext(projectManagementAppContext) as projectManagementAppContextType;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const credentials: Credentials = {
            username,
            password
        };

        try {
            const result = await authApi.login(credentials);
            
            if (result.success && result.token && result.user) {
                localStorage.setItem('token', result.token);
                const storedToken = localStorage.getItem('token');               
                if (storedToken) {
                    setUser(result.user);
                    setIsAuthenticated(true);
                    setScreenState('Home');
                } else {
                    setError('Failed to set authentication token');
                }
            } else {
                setError(result.message || 'Invalid username or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
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
            <Container maxWidth="sm" sx={{ textAlign: 'center', mb: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <img 
                        src="/logo-final.png" 
                        alt="NJSEI Logo" 
                        style={{ 
                            maxWidth: '200px',
                            marginBottom: '1rem'
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
                    NJSEI ISO 9000 Forms Project Management Application
                </Typography>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        mb: 4,
                        color: '#666'
                    }}
                >
                    Version 1.3.0

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
                    <Typography variant="h5" component="h2" align="center" gutterBottom>
                        Login to your account
                    </Typography>
                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label="Username"
                            variant="outlined"
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ 
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            sx={{ 
                                mt: 2,
                                mb: 2,
                                py: 1.5,
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '1.1rem'
                            }}
                        >
                            Log In
                        </Button>
                    </form>
                    <Typography variant="body2" align="center" sx={{ mt: 2, color: '#666' }}>
                        <a href="#" style={{ color: '#1976d2', textDecoration: 'none' }}>
                            Forgot password?
                        </a>
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
        </Box>
    );
};
