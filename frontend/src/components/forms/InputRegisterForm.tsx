import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const InputRegisterForm: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        PMD3. Input Register
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Input Register form content will be implemented here.
        </Typography>
      </Box>
    </Paper>
  );
};

export default InputRegisterForm;
