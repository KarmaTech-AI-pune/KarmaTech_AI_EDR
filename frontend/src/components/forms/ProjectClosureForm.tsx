import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ProjectClosureForm: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        PMD8. Project Closure
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Project Closure form content will be implemented here.
        </Typography>
      </Box>
    </Paper>
  );
};

export default ProjectClosureForm;
