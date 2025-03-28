// src/pages/ProjectManagementDashboard.jsx
import React from 'react';
import { Container, Grid, Typography, Paper, Box } from '@mui/material';
import { ProjectProgressChart } from '../components/dashboard/ProjectManagementCharts';
import ProjectStatusPieChart from '../components/dashboard/ProjectStatusPieChart';

const ProjectManagementDashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Project Management Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ProjectStatusChart />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ProjectProgressChart />
        </Grid>
        
        {/* You can add more dashboard components here */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            {/* Additional project overview elements could go here */}
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" gutterBottom>
                • City Water Supply Upgrade: Monthly Progress Review updated
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Rural Sanitation Initiative: WBS updated
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Coastal Zone Protection: New Change Control submitted
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Urban Flood Management: Input Register updated
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProjectManagementDashboard;