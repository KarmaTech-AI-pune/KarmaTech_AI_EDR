import { useState, useCallback, useEffect } from 'react';
import { validateCurrencyInput} from '../utils/currencyFormatter';

/**
 * Return type for usePercentageInput hook
 */
interface UseFloatInputReturn {
  /** Display value for TextField */
  value: string | number;
  /** Change handler for TextField */
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Get raw numeric value for form submission */
  getRawValue: () => number;
  /** Programmatically set value */
  setValue: (value: number | string) => void;
  /** Get change handler with automatic formData sync */
  getChangeHandler: (onValueChange?: (rawValue: number) => void) => 
    (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Custom hook for managing percentage input fields
 * 
 * Features:
 * - Shows "0" initially but auto-clears when user starts typing
 * - Validates format (max 2 decimal places)
 * - No comma formatting (unlike currency fields)
 * - Easy integration with form state
 * 
 * @param initialValue - Initial value (number or string)
 * @param name - Field name for debugging (optional)
 * @returns Object with value, handlers, and utilities
 * 
 * @example Basic usage
 * ```typescript
 * const percentage = usePercentageInput(formData.percentage);
 * 
 * <TextField
 *   value={percentage.value}
 *   onChange={percentage.handleChange}
 * />
 * ```
 * 
 * @example With formData sync
 * ```typescript
 * const percentage = usePercentageInput(formData.percentage);
 * 
 * <TextField
 *   value={percentage.value}
 *   onChange={percentage.getChangeHandler((rawValue) => {
 *     setFormData(prev => ({ ...prev, percentage: rawValue }));
 *   })}
 * />
 * ```
 */
export const usePercentageInput = (
  initialValue?: number | string,
  name?: string
): UseFloatInputReturn => {
  
  /**
   * Initialize value from various input types
   * Shows "0" for zero values, empty string for undefined/null
   */
  const getInitialValue = useCallback(() => {
    if (initialValue === undefined || initialValue === null || initialValue === '') return '';
    return initialValue;  // Keep as-is (0 shows as 0, "5.75" shows as "5.75")
  }, [initialValue]);

  const [value, setValue] = useState<string | number>(getInitialValue);

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
   * Handle input change with validation and auto-clear "0"
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Auto-clear "0" when user starts typing (mimics currency field behavior)
    if (value === 0 && inputValue && inputValue !== '0') {
      inputValue = inputValue.replace(/^0+/, '');  // Remove leading zeros
    }
    
    // Validate: allow empty or valid format (digits + one decimal + max 2 decimal places)
    if (inputValue === '' || validateCurrencyInput(inputValue)) {
      setValue(inputValue);
    }
  }, [value]);

  /**
   * Get raw numeric value for calculations and API submission
   */
  const getRawValue = useCallback((): number => {
    if (value === '' || value === null || value === undefined) return 0;
    const parsed = typeof value === 'number' ? value : parseFloat(String(value));
    return isNaN(parsed) ? 0 : parsed;
  }, [value]);

  /**
   * Programmatically set value (e.g., from calculations)
   */
  const setValueProgrammatically = useCallback((newValue: number | string) => {
    if (newValue === undefined || newValue === null || newValue === '') {
      setValue('');
    } else {
      setValue(newValue);
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
        // First, handle the validation and auto-clear
        handleChange(e);
        
        // Then sync raw value to parent state if callback provided
        if (onValueChange) {
          setTimeout(() => {
            const inputValue = e.target.value;
            // Auto-clear logic for callback sync
            let cleanValue = inputValue;
            if (value === 0 && inputValue && inputValue !== '0') {
              cleanValue = inputValue.replace(/^0+/, '');
            }
            
            const rawValue = cleanValue === '' ? 0 : parseFloat(cleanValue);
            onValueChange(isNaN(rawValue) ? 0 : rawValue);
          }, 0);
        }
      },
    [handleChange, value]
  );

  return {
    value,
    handleChange,
    getRawValue,
    setValue: setValueProgrammatically,
    getChangeHandler
  };
};
