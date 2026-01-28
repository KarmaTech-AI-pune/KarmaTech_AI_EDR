import React, { memo } from 'react';
import { TextField } from '@mui/material';
import { useCurrencyInput } from '../../../hooks/useCurrencyInput';

/**
 * Props for TotalCostDisplay component
 */
interface TotalCostDisplayProps {
  /** Total cost value to display */
  value: string | number;
  /** Optional: Additional aria label for accessibility */
  ariaLabel?: string;
}

/**
 * TotalCostDisplay Component
 * 
 * Read-only display field for total cost with Indian currency formatting
 * Uses useCurrencyInput hook for consistent currency display (XX,XX,XXX.XX format)
 * 
 * Features:
 * - Displays cost with Indian number grouping (lakhs, crores)
 * - Comma-separated thousands formatting
 * - Read-only (disabled state with gray background)
 * - Consistent height (40px) matching other WBS inputs
 * - Optimized re-renders via React.memo
 * 
 * @example
 * <TotalCostDisplay value={row.totalCost} />
 * <TotalCostDisplay value={childTotals.totalCost} />
 */
const TotalCostDisplay: React.FC<TotalCostDisplayProps> = memo(({ 
  value,
  ariaLabel = 'Total cost'
}) => {
  // Use currency input hook for Indian currency formatting
  const formattedCost = useCurrencyInput(value, 'total-cost');

  return (
    <TextField
      fullWidth
      size="small"
      type="text"
      value={formattedCost.value}
      disabled
      inputProps={{
        'aria-label': ariaLabel,
        readOnly: true,
      }}
      sx={{
        bgcolor: '#f5f5f5',
        '& .MuiInputBase-root': { 
          height: '40px',
        },
        '& .MuiInputBase-input': {
          padding: '8px 12px',
          textAlign: 'left',
          color: 'text.primary',
          WebkitTextFillColor: 'currentColor', // Override disabled text color
        },
        '& .Mui-disabled': {
          WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
        },
      }}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if value changes
  return prevProps.value === nextProps.value;
});

TotalCostDisplay.displayName = 'TotalCostDisplay';

export default TotalCostDisplay;
