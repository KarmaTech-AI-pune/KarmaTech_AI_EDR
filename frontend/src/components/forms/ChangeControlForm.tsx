import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ChangeControlForm: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        PMD6. Change Control Register
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Change Control Register form content will be implemented here.
        </Typography>
      </Box>
    </Paper>
  );
};

export default ChangeControlForm;
