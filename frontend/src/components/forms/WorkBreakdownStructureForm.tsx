import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const WorkBreakdownStructureForm: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        PMD2. Work Breakdown Structure
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Work Breakdown Structure form content will be implemented here.
        </Typography>
      </Box>
    </Paper>
  );
};

export default WorkBreakdownStructureForm;
