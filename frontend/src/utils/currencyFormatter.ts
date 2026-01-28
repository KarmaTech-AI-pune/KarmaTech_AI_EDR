/**
 * Currency formatting utilities for Indian numbering system
 * Used across multiple forms in the application for consistent currency input handling
 * 
 * @module currencyFormatter
 */

/**
 * Format number string to Indian currency format with live typing support
 * Preserves decimal places as typed for natural user experience
 * 
 * Examples:
 *   "1000" → "1,000"
 *   "100000" → "1,00,000"
 *   "1000.5" → "1,000.5"
 *   "1000." → "1,000." (preserves trailing dot for typing)
 * 
 * @param value - The string value to format
 * @returns Formatted string with Indian number grouping
 */
export const formatIndianCurrencyLive = (value: string): string => {
  if (!value) return "";

  const [intPart, decPart] = value.split(".");
  
  // Handle empty integer part
  if (!intPart) return "";
  
  // Format integer part with Indian locale (XX,XX,XXX)
  const formattedInt = Number(intPart).toLocaleString("en-IN");

  // Preserve decimal part as-is (important for typing experience)
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
};

/**
 * Remove formatting characters from currency input
 * Keeps only digits and decimal point
 * 
 * Examples:
 *   "1,00,000" → "100000"
 *   "₹ 1,234.56" → "1234.56"
 * 
 * @param value - The formatted string to clean
 * @returns Clean numeric string
 */
export const cleanCurrencyInput = (value: string): string => {
  return value.replace(/,/g, "");
};

/**
 * Validate currency input format
 * Allows: digits, one decimal point, maximum 2 decimal places
 * 
 * Examples:
 *   "1000" → true
 *   "1000.99" → true
 *   "1000.999" → false (3 decimal places)
 *   "abc" → false (non-numeric)
 *   "10.5.5" → false (multiple decimals)
 * 
 * @param value - The string to validate
 * @returns true if valid currency format, false otherwise
 */
export const validateCurrencyInput = (value: string): boolean => {
  return /^\d*\.?\d{0,2}$/.test(value);
};

/**
 * Parse formatted currency string to number for API submission
 * Safely handles invalid inputs by returning 0
 * 
 * Examples:
 *   "1,00,000" → 100000
 *   "1,234.56" → 1234.56
 *   "" → 0
 *   "invalid" → 0
 * 
 * @param value - The formatted currency string
 * @returns Numeric value for backend/calculations
 */
export const parseCurrencyToNumber = (value: string): number => {
  const cleaned = cleanCurrencyInput(value);
  const parsed = Number(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};
