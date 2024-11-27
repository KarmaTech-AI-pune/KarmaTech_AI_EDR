import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ProgressReviewForm: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        PMD7. Monthly Progress Review
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Monthly Progress Review form content will be implemented here.
        </Typography>
      </Box>
    </Paper>
  );
};

export default ProgressReviewForm;
