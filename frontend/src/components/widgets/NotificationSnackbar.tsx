import React from 'react';
import { Snackbar, Alert, AlertProps, SnackbarOrigin } from '@mui/material';

interface NotificationSnackbarProps {
  open: boolean;
  message: string;
  severity: AlertProps['severity'];
  onClose: () => void;
  anchorOrigin?: SnackbarOrigin; // Make anchorOrigin optional
}

const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  open,
  message,
  severity,
  onClose,
  anchorOrigin = { vertical: 'bottom', horizontal: 'center' }, // Default to bottom-center
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
