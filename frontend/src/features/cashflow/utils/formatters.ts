/**
 * Formatting utilities for Cash Flow Feature
 * Reusable formatters to maintain consistency across components
 */

import { CURRENCY_CONFIG } from './constants';

/**
 * Format number as currency (Indian Rupees)
 * @param value - Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.currency,
    maximumFractionDigits: CURRENCY_CONFIG.maximumFractionDigits,
  }).format(Math.abs(value));
};

/**
 * Format number with locale-specific formatting
 * @param value - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale).format(value);
};

/**
 * Get CSS class for value color based on positive/negative
 * @param value - Number to evaluate
 * @param colorScheme - Object with POSITIVE and NEGATIVE color classes
 * @returns CSS class string
 */
export const getValueColorClass = (
  value: number,
  colorScheme: { POSITIVE: string; NEGATIVE: string }
): string => {
  return value < 0 ? colorScheme.NEGATIVE : colorScheme.POSITIVE;
};

/**
 * Format currency with sign and color (for table cells)
 * @param value - Number to format
 * @returns Object with formatted value and sign
 */
export const formatCurrencyWithSign = (value: number): { sign: string; formatted: string } => {
  return {
    sign: value < 0 ? '-' : '',
    formatted: formatCurrency(value),
  };
};

/**
 * Format percentage
 * @param value - Number to format as percentage
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Safely format currency, handling null/undefined
 * @param value - Number to format (may be null/undefined)
 * @returns Formatted currency or default value
 */
export const safeCurrencyFormat = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0';
  }
  return formatCurrency(value);
};
