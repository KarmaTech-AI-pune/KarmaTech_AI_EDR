import { useState, useContext  } from 'react'
import { 
    TextField, 
    Button, 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Alert
  } from '@mui/material';
  import { login } from '../utils/auth';
  import { projectManagementAppContext } from '../App';
  import { projectManagementAppContextType } from '../types';
  
  const LoginScreen: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setScreenState, setIsAuthenticated } = useContext(projectManagementAppContext) as projectManagementAppContextType;
  
    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const success = await login({ username, password });
        if (success) {
          setIsAuthenticated(true);
          setScreenState('Home');
        } else {
          setError('Invalid username or password');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      }
    };
  
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="background.default"
      >
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent>
            <Typography variant="h5" component="h2" align="center" gutterBottom>
              NJSEI Project Management
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
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
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                color="primary"
                sx={{ mt: 2 }}
              >
                Log In
              </Button>
            </form>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              <a href="#" style={{ color: 'primary.main' }}>Forgot password?</a>
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
              maxWidth: 300 
            }}
          >
            {error}
          </Alert>
        )}
      </Box>
    );
  };
  
  export default LoginScreen;