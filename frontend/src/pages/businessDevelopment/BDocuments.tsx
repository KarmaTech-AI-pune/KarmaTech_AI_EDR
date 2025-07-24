import React from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';

export const BDocuments: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Documents</Typography>
        <Typography variant="body1" color="text.secondary">
          Document management section will be implemented here
        </Typography>
      </Paper>
    </Box>
  );
};

export default BDocuments;
