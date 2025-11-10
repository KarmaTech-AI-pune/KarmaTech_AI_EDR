import React from 'react';
import { Typography, Paper } from '@mui/material';

const ProjectTimeline: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Timeline</Typography>
      <Typography variant="body1" color="text.secondary">
        Project timeline section will be implemented here
      </Typography>
    </Paper>
  );
};

export default ProjectTimeline;
