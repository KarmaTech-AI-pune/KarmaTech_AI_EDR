import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ProjectStatusPieChart from '../dashboard/ProjectStatusPieChart';

const ProjectManagement = () => {
  return (
    <Box>
      {/* Header section with title and Initialize Project button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h5" color="primary">
          Project Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<span>+</span>}
        >
          Initialize Project
        </Button>
      </Box>

      {/* Project Status Pie Chart - Placed directly below header */}
      <Box sx={{ 
        width: '100%', 
        maxWidth: 400,
        mx: 'auto',
        mb: 4,
        mt: 2
      }}>
        <ProjectStatusPieChart />
      </Box>

      {/* Search Box */}
      <Box sx={{ mb: 3 }}>
        <input
          type="text"
          placeholder="Search projects"
          style={{
            width: '240px',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </Box>

      {/* Project list will be rendered here */}
    </Box>
  );
};

export default ProjectManagement;
