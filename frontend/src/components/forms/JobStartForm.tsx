import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const JobStartForm: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        PMD1. Job Start Form
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Job Start Form content will be implemented here.
        </Typography>
      </Box>
    </Paper>
  );
};

export default JobStartForm;
