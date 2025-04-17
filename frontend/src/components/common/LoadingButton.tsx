import React from 'react';
import { Button, CircularProgress, SxProps } from '@mui/material';

interface LoadingButtonProps {
  loading?: boolean;
  onClick: () => void;
  text: string;
  loadingText: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  fontWeight?: string | number;
  sx?: SxProps;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  onClick,
  text,
  loadingText,
  disabled = false,
  size = 'small',
  fontWeight = 'normal',
  sx,
}) => {
  return (
    <Button
      variant="contained"
      color="primary"
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      sx={{
        px: 4,
        py: 1,
        borderRadius: 1,
        fontWeight: fontWeight,
        boxShadow: 2,
        ...(sx || {})
      }}
    >
      {loading ? (
        <>
          <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
          {loadingText}
        </>
      ) : (
        text
      )}
    </Button>
  );
};

export default LoadingButton;