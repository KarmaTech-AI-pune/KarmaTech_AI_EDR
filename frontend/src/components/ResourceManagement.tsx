import { Typography, Grid, Box } from '@mui/material';

export const ResourceManagement = () => {
  return (
    <Box 
      sx={{ 
        p: 2,
        bgcolor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          fontWeight: 500,
          color: '#1a237e',
          mb: 2
        }}
      >
        Resource Management
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle1" sx={{ color: '#424242' }}>
            Total Resources: 50
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" sx={{ color: '#424242' }}>
            Available: 30
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" sx={{ color: '#424242' }}>
            Assigned: 20
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" sx={{ color: '#424242' }}>
            Utilization: 40%
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
