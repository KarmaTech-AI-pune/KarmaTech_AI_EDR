import { useState, useCallback, useRef, useEffect } from 'react';
import {
  formatIndianCurrencyLive,
  cleanCurrencyInput,
  validateCurrencyInput,
  parseCurrencyToNumber
} from '../utils/currencyFormatter';

/**
 * Return type for useCurrencyInput hook
 */
interface UseCurrencyInputReturn {
  /** Formatted display value for TextField */
  value: string;
  /** Change handler for TextField */
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Get raw numeric value for form submission */
  getRawValue: () => number;
  /** Programmatically set value (formats automatically) */
  setValue: (value: number | string) => void;
  /** Get change handler with automatic formData sync */
  getChangeHandler: (onValueChange?: (rawValue: number) => void) => 
    (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Custom hook for managing Indian currency formatted inputs
 * 
 * Features:
 * - Live formatting with Indian number grouping (XX,XX,XXX)
 * - Cursor position preservation during typing
 * - Decimal preservation (e.g., typing "1000." keeps the dot)
 * - Input validation (max 2 decimal places)
 * - Easy integration with form state
 * 
 * @param initialValue - Initial value (number or formatted string)
 * @param name - Field name for debugging (optional)
 * @returns Object with value, handlers, and utilities
 * 
 * @example Basic usage
 * ```typescript
 * const cost = useCurrencyInput(project?.cost, 'cost');
 * 
 * <TextField
 *   value={cost.value}
 *   onChange={cost.handleChange}
 * />
 * 
 * // On submit:
 * const rawCost = cost.getRawValue();
 * ```
 * 
 * @example With formData sync
 * ```typescript
 * const cost = useCurrencyInput(formData.cost, 'cost');
 * 
 * <TextField
 *   value={cost.value}
 *   onChange={cost.getChangeHandler((rawValue) => {
 *     setFormData(prev => ({ ...prev, cost: rawValue }));
 *   })}
 * />
 * ```
 */
export const useCurrencyInput = (
  initialValue?: number | string,
  name?: string
): UseCurrencyInputReturn => {
  
  /**
   * Initialize formatted value from various input types
   */
  const getInitialValue = useCallback(() => {
    if (initialValue === undefined || initialValue === null || initialValue === '') return '';
    if (typeof initialValue === 'number') {
      return formatIndianCurrencyLive(String(initialValue));
    }
    return formatIndianCurrencyLive(cleanCurrencyInput(String(initialValue)));
  }, [initialValue]);

  const [value, setValue] = useState<string>(getInitialValue);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Update value when initialValue changes (useful for edit mode or programmatic updates)
   */
  useEffect(() => {
    const newValue = getInitialValue();
    if (newValue !== value) {
      setValue(newValue);
    }
  }, [initialValue]);

  /**
   * Handle input change with formatting and cursor position preservation
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    inputRef.current = input;

    const rawValue = cleanCurrencyInput(input.value);

    // Validate: allow only digits + one decimal + max 2 decimal places
    if (rawValue && !validateCurrencyInput(rawValue)) {
      return; // Reject invalid input
    }

    // Store cursor position before formatting
    const cursorPosition = input.selectionStart || 0;
    const prevLength = input.value.length;

    // Format the value
    const formattedValue = formatIndianCurrencyLive(rawValue);

    // Update state
    setValue(formattedValue);

    // Restore cursor position after React re-render
    // Use setTimeout to wait for DOM update
    setTimeout(() => {
      if (inputRef.current) {
        const newLength = formattedValue.length;
        const diff = newLength - prevLength;
        const newCursorPosition = Math.max(0, cursorPosition + diff);
        
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  }, []);

  /**
   * Get raw numeric value for calculations and API submission
   */
  const getRawValue = useCallback((): number => {
    return parseCurrencyToNumber(value);
  }, [value]);

  /**
   * Programmatically set value (e.g., from percentage calculation)
   */
  const setValueProgrammatically = useCallback((newValue: number | string) => {
    if (typeof newValue === 'number') {
      setValue(formatIndianCurrencyLive(String(newValue)));
    } else {
      setValue(formatIndianCurrencyLive(cleanCurrencyInput(String(newValue))));
    }
  }, []);

  /**
   * Get change handler with automatic callback for formData sync
   * This wrapper calls handleChange and then invokes the callback with raw value
   * 
   * @param onValueChange - Optional callback that receives the raw numeric value
   * @returns Change handler for TextField
   */
  const getChangeHandler = useCallback(
    (onValueChange?: (rawValue: number) => void) => 
      (e: React.ChangeEvent<HTMLInputElement>) => {
        // First, handle the formatting and cursor
        handleChange(e);
        
        // Then sync raw value to parent state if callback provided
        if (onValueChange) {
          setTimeout(() => {
            const rawValue = parseCurrencyToNumber(e.target.value);
            onValueChange(rawValue);
          }, 0);
        }
      },
    [handleChange]
  );

  return {
    value,
    handleChange,
    getRawValue,
    setValue: setValueProgrammatically,
    getChangeHandler
  };
};
