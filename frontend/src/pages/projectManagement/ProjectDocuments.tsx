import React from 'react';
import { Typography, Paper } from '@mui/material';

const ProjectDocuments: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Documents</Typography>
      <Typography variant="body1" color="text.secondary">
        Document management section will be implemented here
      </Typography>
    </Paper>
  );
};

export default ProjectDocuments;
