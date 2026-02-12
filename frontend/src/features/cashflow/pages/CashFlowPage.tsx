/**
 * CashFlowPage - Main Page Container
 * Senior-level architecture with Material UI
 */

import React from 'react';
import { Container, Box, Snackbar, Alert } from '@mui/material';
import { CashFlowProvider, useCashFlowUIContext, useCashFlowDataContext } from '../context/CashFlowContext';
import { CashFlowHeader } from '../components/CashFlowHeader';
import { MonthlyBudgetTable } from '../components/MonthlyBudgetTable';
import { PaymentScheduleTable } from '../components/PaymentScheduleTable';

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
  const { viewMode, data } = useCashFlowDataContext();
  const { setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen } = useCashFlowUIContext();

  const handleAddMilestone = (milestone: any) => {
    // TODO: Implement API call to add milestone
    console.log('Adding milestone:', milestone);
    
    // Show success message
    setSnackbarMessage('Payment schedule added successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // TODO: Refresh data after adding
  };

  return (
    <Box sx={{ py: 4 }}>
      <CashFlowHeader />

      {/* Show Budget Dashboard when BudgetDashboard tab is selected */}
      {viewMode === 'BudgetDashboard' && (
        <Box>
          {/* Monthly Budget Table - Always show with headers */}
          <MonthlyBudgetTable data={data?.monthlyBudget} />
        </Box>
      )}

      {/* Show Payment Schedule when PaymentSchedule tab is selected */}
      {viewMode === 'PaymentSchedule' && (
        <Box>
          {/* Payment Schedule Table - Always show with headers */}
          <PaymentScheduleTable 
            data={data?.paymentSchedule}
            onAddMilestone={handleAddMilestone}
          />
        </Box>
      )}

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
