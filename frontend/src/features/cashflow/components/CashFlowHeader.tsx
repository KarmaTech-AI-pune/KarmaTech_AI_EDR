/**
 * CashFlowHeader Component (Smart Component with Material UI)
 * Container component that connects to context
 */

import React from 'react';
import { Box, Paper, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { useCashFlowDataContext, useCashFlowActionsContext } from '../context/CashFlowContext';
import { ViewToggle } from './ViewToggle';

export const CashFlowHeader: React.FC = () => {
  const { viewMode, showProjections } = useCashFlowDataContext();
  const { setViewMode, toggleProjections } = useCashFlowActionsContext();

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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
        }}
      >
        {/* View Mode Tabs */}
        <Box sx={{ flex: 1 }}>
          <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
        </Box>

        {/* Show Projections Checkbox */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showProjections}
                onChange={toggleProjections}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                Show Projections
              </Typography>
            }
          />
        </Box>
      </Box>
    </Paper>
  );
};
