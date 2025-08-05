import { Box, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const EnhancedLoginLink = () => {
  const navigate = useNavigate();

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        m: 2, 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      <Typography variant="h6" gutterBottom>
        🚀 Multi-Tenant Testing Interface
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Access the enhanced login system for testing Super Admin and Tenant-specific functionality
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={() => navigate('/enhanced-login')}
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
          }}
        >
          Enhanced Login
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/admin')}
          sx={{ 
            borderColor: 'rgba(255,255,255,0.5)', 
            color: 'white',
            '&:hover': { borderColor: 'white' }
          }}
        >
          Admin Panel
        </Button>
      </Box>
    </Paper>
  );
};

export default EnhancedLoginLink; 