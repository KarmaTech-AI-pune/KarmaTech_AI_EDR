/**
 * ViewToggle Component (Dumb Component)
 * Material UI Tabs for view mode switching
 */

import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { ViewToggleProps } from '../types';
import { VIEW_MODES, VIEW_LABELS } from '../utils';

export const ViewToggle: React.FC<ViewToggleProps> = ({ activeView, onViewChange }) => {
  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    onViewChange(newValue as typeof activeView);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={activeView}
        onChange={handleChange}
        aria-label="cash flow view tabs"
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            minHeight: 48,
          },
        }}
      >
        <Tab
          label={VIEW_LABELS[VIEW_MODES.BUDGET_DASHBOARD]}
          value={VIEW_MODES.BUDGET_DASHBOARD}
        />
        <Tab
          label={VIEW_LABELS[VIEW_MODES.PAYMENT_SCHEDULE]}
          value={VIEW_MODES.PAYMENT_SCHEDULE}
        />
      </Tabs>
    </Box>
  );
};
