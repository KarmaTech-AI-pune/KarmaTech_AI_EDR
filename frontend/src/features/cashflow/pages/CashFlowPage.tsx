/**
 * CashFlowPage - Main Page Container
 * Senior-level architecture with Material UI
 */

import React from 'react';
import { Container, Box, Snackbar, Alert } from '@mui/material';
import { CashFlowProvider, useCashFlowUIContext } from '../context/CashFlowContext';
import { CashFlowHeader } from '../components/CashFlowHeader';
import { CashFlowTable } from '../components/CashFlowTable';

// Snackbar Component (handles notifications)
const CashFlowSnackbar: React.FC = () => {
  const { snackbarOpen, snackbarMessage, snackbarSeverity, setSnackbarOpen } = useCashFlowUIContext();

  const handleClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );
};

// Main Content Component
const CashFlowContent: React.FC = () => {
  return (
    <Box sx={{ py: 4 }}>
      <CashFlowHeader />
      <CashFlowTable />
      <CashFlowSnackbar />
    </Box>
  );
};

// Main Page Export
export const CashFlowPage: React.FC = () => {
  return (
    <CashFlowProvider>
      <Container maxWidth="xl">
        <CashFlowContent />
      </Container>
    </CashFlowProvider>
  );
};

export default CashFlowPage;
