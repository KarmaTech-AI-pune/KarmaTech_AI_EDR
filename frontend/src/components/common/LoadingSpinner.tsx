// LoadingSpinner.tsx
import React from 'react';
import { CircularProgress, Backdrop, Box } from '@mui/material';

interface LoadingSpinnerProps {
  loading: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ loading }) => {
  return (
    <Backdrop
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        display: loading ? 'flex' : 'none'
      }}
      open={loading}
    >
      <Box sx={{ display: 'flex' }}>
        <CircularProgress color="primary" />
      </Box>
    </Backdrop>
  );
};

export default LoadingSpinner;
