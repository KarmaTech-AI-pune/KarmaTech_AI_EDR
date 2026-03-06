/**
 * CashFlowHeader Component (Smart Component with Material UI)
 * Container component that connects to context
 */

import React from 'react';
import { Box, Paper } from '@mui/material';
import { useCashFlowDataContext, useCashFlowActionsContext } from '../context/CashFlowContext';
import { ViewToggle } from './ViewToggle';

export const CashFlowHeader: React.FC = () => {
  const { viewMode } = useCashFlowDataContext();
  const { setViewMode } = useCashFlowActionsContext();

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
        }}
      >
        {/* View Mode Tabs */}
        <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
      </Box>
    </Paper>
  );
};
