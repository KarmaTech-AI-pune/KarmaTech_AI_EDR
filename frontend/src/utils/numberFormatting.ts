/**
 * Utility functions for formatting numbers according to Indian numbering system
 */

/**
 * Formats a number to Indian numbering system (e.g., 1,00,000 instead of 1,000,000)
 * @param num - The number to format
 * @returns Formatted string with Indian commas
 */
export const formatToIndianNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '';
  }

  // Convert to string and handle negative numbers
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const numStr = absNum.toString();

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = numStr.split('.');

  // Handle numbers less than 1000 (no formatting needed)
  if (absNum < 1000) {
    return isNegative ? `-${integerPart}` : integerPart;
  }

  // Format according to Indian system
  let formatted = '';

  // Process from right to left
  for (let i = integerPart.length - 1; i >= 0; i--) {
    formatted = integerPart[i] + formatted;

    const remainingLength = i;
    const distanceFromEnd = integerPart.length - i - 1;

    // Add comma after first 3 digits from right, then after every 2 digits
    if ((distanceFromEnd === 3 && remainingLength > 0) ||
      (distanceFromEnd > 3 && (distanceFromEnd - 3) % 2 === 0 && remainingLength > 0)) {
      formatted = ',' + formatted;
    }
  }

  // Add decimal part if exists
  if (decimalPart) {
    formatted += '.' + decimalPart;
  }

  // Add negative sign if needed
  if (isNegative) {
    formatted = '-' + formatted;
  }

  return formatted;
};

/**
 * Formats a number to Indian currency format with symbol
 * @param num - The number to format
 * @param currencySymbol - Currency symbol (default: ₹)
 * @returns Formatted currency string
 */
export const formatToIndianCurrency = (num: number | null | undefined, currencySymbol: string = '₹'): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '';
  }

  return `${currencySymbol} ${formatToIndianNumber(num)}`;
};

/**
 * Parses a formatted Indian number string back to a raw number
 * @param formattedStr - The formatted string to parse
 * @returns Raw number
 */
export const parseIndianNumber = (formattedStr: string): number => {
  if (!formattedStr || typeof formattedStr !== 'string') {
    return 0;
  }

  // Remove all commas and parse as number
  const cleanStr = formattedStr.replace(/,/g, '');
  const parsed = parseFloat(cleanStr);

  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formats a number for display in input fields (removes formatting for editing)
 * @param num - The number to format for input
 * @returns String representation for input field
 */
export const formatForInput = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '';
  }
  return num.toString();
};

/**
 * Formats a number for display in read-only fields or tables
 * @param num - The number to format for display
 * @returns Formatted string with Indian numbering
 */
export const formatForDisplay = (num: number | null | undefined): string => {
  return formatToIndianNumber(num);
};
/**
 * Formats a number or string for display in input fields, supporting intermediate typing states and Indian numbering
 * @param num - The value to format
 * @returns Formatted string with Indian commas
 */
export const formatIndianNumber = (num: number | string | undefined): string => {
  if (num === undefined || num === null || num === '') return '';

  // Convert to string and strip existing commas
  const strNum = num.toString().replace(/,/g, '');

  // Handle special cases for intermediate typing states
  if (strNum === '-') return '-';
  if (strNum === '.') return '.';

  // Split into integer and decimal parts to preserve formatting of the decimal part
  const parts = strNum.split('.');
  const integerPartStr = parts[0];
  const decimalPartStr = parts.length > 1 ? parts[1] : null;

  // Format the integer part using Indian numbering system
  let formattedInteger = '';
  if (integerPartStr === '' || integerPartStr === '-') {
    formattedInteger = integerPartStr;
  } else {
    const integerPart = parseFloat(integerPartStr);
    if (isNaN(integerPart)) return '';
    formattedInteger = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(integerPart);
  }

  // Join with decimal part if it exists (even if empty, e.g., "10.")
  if (decimalPartStr !== null) {
    return `${formattedInteger}.${decimalPartStr}`;
  }

  return formattedInteger;
};
