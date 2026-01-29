import React, { memo, useCallback } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useFloatInput } from '../../../hooks/useFloatInput';

/**
 * Props for PlannedHoursInput component
 * Extends core TextField props while adding WBS-specific requirements
 */
interface PlannedHoursInputProps {
  /** Unique row identifier */
  rowId: string;
  /** Month identifier (e.g., "Jan 24") */
  month: string;
  /** Initial hours value from row data */
  initialValue: string | number;
  /** Whether input is disabled (e.g., in edit mode) */
  disabled: boolean;
  /** Callback when hours value changes - receives raw numeric value */
  onValueChange: (rowId: string, month: string, value: string) => void;
  /** Optional: Background color override */
  backgroundColor?: string;
  /** Optional: Additional TextField props for extensibility */
  textFieldProps?: Partial<TextFieldProps>;
}

/**
 * PlannedHoursInput Component
 * 
 * Specialized input field for WBS planned hours with:
 * - Float validation (max 2 decimals)
 * - Auto-clear "0" on focus
 * - Optimized re-renders via React.memo
 * - Type-safe value handling
 * 
 * @example
 * <PlannedHoursInput
 *   rowId="row-123"
 *   month="Jan 24"
 *   initialValue={8.5}
 *   disabled={false}
 *   onValueChange={handleHoursChange}
 * />
 */
const PlannedHoursInput: React.FC<PlannedHoursInputProps> = memo(({
  rowId,
  month,
  initialValue,
  disabled,
  onValueChange,
  backgroundColor,
  textFieldProps = {},
}) => {
  // Initialize float input hook with current value
  const floatInput = useFloatInput(
    initialValue, 
    `planned-hours-${rowId}-${month}`
  );

  /**
   * Memoized change handler to prevent function recreation on every render
   * Extracts raw numeric value and syncs with parent state
   */
  const handleChange = useCallback(
    floatInput.getChangeHandler((rawValue: number) => {
      onValueChange(rowId, month, rawValue.toString());
    }),
    [floatInput.getChangeHandler, onValueChange, rowId, month]
  );

  return (
    <TextField
      fullWidth
      size="small"
      type="text"
      value={floatInput.value}
      onChange={handleChange}
      disabled={disabled}
      inputProps={{
        'aria-label': `Planned hours for ${month}`,
        'data-testid': `hours-input-${rowId}-${month}`,
      }}
      sx={{
        bgcolor: backgroundColor ?? (disabled ? '#f5f5f5' : 'white'),
        '& .MuiInputBase-root': { 
          height: '40px',
        },
        '& .MuiInputBase-input': {
          padding: '8px 12px',
          textAlign: 'left',
        },
        // Prevent spinner arrows in number inputs
        '& input[type=number]': {
          MozAppearance: 'textfield',
        },
        '& input[type=number]::-webkit-outer-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
        '& input[type=number]::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
        ...textFieldProps.sx,
      }}
      {...textFieldProps}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  // Only re-render if these specific props change
  return (
    prevProps.rowId === nextProps.rowId &&
    prevProps.month === nextProps.month &&
    prevProps.initialValue === nextProps.initialValue &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.backgroundColor === nextProps.backgroundColor
  );
});

PlannedHoursInput.displayName = 'PlannedHoursInput';

export default PlannedHoursInput;
