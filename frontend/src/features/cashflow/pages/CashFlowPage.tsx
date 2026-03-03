/**
 * CashFlowPage - Main Page Container
 * Senior-level architecture with Material UI
 */

import React from 'react';
import { Container, Box, Snackbar, Alert } from '@mui/material';
import { CashFlowProvider, useCashFlowUIContext, useCashFlowDataContext, useCashFlowActionsContext } from '../context/CashFlowContext';
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
  const { addPaymentMilestone } = useCashFlowActionsContext();
  const { setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen } = useCashFlowUIContext();

  const handleAddMilestone = async (milestone: any) => {
    try {
      console.log('CashFlowPage: Adding milestone:', milestone);
      
      // Call the hook's addPaymentMilestone method
      await addPaymentMilestone(milestone);
      
      // Show success message
      setSnackbarMessage('Payment schedule added successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      console.log('CashFlowPage: Milestone added and data refreshed');
    } catch (error) {
      console.error('CashFlowPage: Error adding milestone:', error);
      
      // Show error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to add payment schedule';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
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
