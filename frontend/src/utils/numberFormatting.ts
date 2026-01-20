/**
 * Utility functions for formatting numbers according to Indian numbering system
 */

const INDIAN_LOCALE = 'en-IN';

/**
 * Formats a number to Indian numbering system (e.g., 1,00,000)
 * @param num - The number to format
 */
export const formatToIndianNumber = (
  num: number | null | undefined
): string => {
  if (num === null || num === undefined || isNaN(num)) return '';

  return new Intl.NumberFormat(INDIAN_LOCALE, {
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Formats a number to Indian currency format with symbol
 * @param num - The number to format
 * @param currencySymbol - Currency symbol (default: ₹)
 */
export const formatToIndianCurrency = (
  num: number | null | undefined,
  currencySymbol: string = '₹'
): string => {
  if (num === null || num === undefined || isNaN(num)) return '';

  const formatted = formatToIndianNumber(num);
  return `${currencySymbol} ${formatted}`;
};

/**
 * Parses a formatted Indian number or currency string back to a raw number
 * @param formattedStr - The formatted string to parse
 */
export const parseIndianNumber = (formattedStr: string): number => {
  if (!formattedStr || typeof formattedStr !== 'string') return 0;

  // Remove commas, currency symbols, spaces
  const cleaned = formattedStr.replace(/[₹,\s]/g, '');
  const parsed = Number(cleaned);

  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formats a number for display in input fields (no commas)
 * @param num - The number to format for input
 */
export const formatForInput = (
  num: number | null | undefined
): string => {
  if (num === null || num === undefined || isNaN(num)) return '';
  return String(num);
};

/**
 * Formats a number for display in read-only fields or tables
 * @param num - The number to format for display
 */
export const formatForDisplay = (
  num: number | null | undefined
): string => {
  return formatToIndianNumber(num);
};

/**
 * Formats a number or string for display while supporting intermediate typing states
 * (Used mainly for controlled inputs)
 */
export const formatIndianNumber = (
  value: number | string | undefined
): string => {
  if (value === undefined || value === null || value === '') return '';

  // Allow intermediate typing states
  if (value === '-' || value === '.') return String(value);

  const numericValue =
    typeof value === 'string'
      ? Number(value.replace(/,/g, ''))
      : value;

  if (isNaN(numericValue)) return '';

  return new Intl.NumberFormat(INDIAN_LOCALE, {
    maximumFractionDigits: 2
  }).format(numericValue);
};
