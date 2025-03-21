import React from 'react';
import { Container, Grid, Typography } from '@mui/material';
import BusinessDevelopmentCharts from '../components/dashboard/BusinessDevelopmentCharts';

const BusinessDevelopmentDashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Business Development Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <BusinessDevelopmentCharts />
        </Grid>
        
        {/* Additional dashboard components can be added here */}
      </Grid>
    </Container>
  );
};

export default BusinessDevelopmentDashboard;
