import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  getValueColorClass,
  formatCurrencyWithSign,
  formatPercentage,
  safeCurrencyFormat,
} from '../../../src/features/cashflow/utils/formatters';
import { COLOR_SCHEME } from '../../../src/features/cashflow/utils/constants';

describe('Formatters Utility', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers as Indian currency', () => {
      const result = formatCurrency(50000);
      expect(result).toBe('₹50,000');
    });

    it('formats negative numbers as positive currency (absolute value)', () => {
      const result = formatCurrency(-50000);
      expect(result).toBe('₹50,000');
    });

    it('formats zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toBe('₹0');
    });

    it('formats large numbers with proper separators', () => {
      const result = formatCurrency(10000000);
      expect(result).toBe('₹1,00,00,000');
    });

    it('formats small numbers correctly', () => {
      const result = formatCurrency(100);
      expect(result).toBe('₹100');
    });

    it('formats decimal numbers without fraction digits', () => {
      const result = formatCurrency(50000.75);
      expect(result).toBe('₹50,001');
    });

    it('handles very large numbers', () => {
      const result = formatCurrency(999999999);
      expect(result).toBe('₹99,99,99,999');
    });

    it('handles numbers with many decimal places', () => {
      const result = formatCurrency(12345.6789);
      expect(result).toBe('₹12,346');
    });

    it('formats one rupee correctly', () => {
      const result = formatCurrency(1);
      expect(result).toBe('₹1');
    });

    it('formats numbers in lakhs correctly', () => {
      const result = formatCurrency(100000);
      expect(result).toBe('₹1,00,000');
    });

    it('formats numbers in crores correctly', () => {
      const result = formatCurrency(10000000);
      expect(result).toBe('₹1,00,00,000');
    });
  });

  describe('formatNumber', () => {
    it('formats positive numbers with locale separators', () => {
      const result = formatNumber(50000);
      expect(result).toBe('50,000');
    });

    it('formats negative numbers with locale separators', () => {
      const result = formatNumber(-50000);
      expect(result).toBe('-50,000');
    });

    it('formats zero correctly', () => {
      const result = formatNumber(0);
      expect(result).toBe('0');
    });

    it('formats large numbers correctly', () => {
      const result = formatNumber(10000000);
      expect(result).toBe('1,00,00,000');
    });

    it('formats decimal numbers', () => {
      const result = formatNumber(12345.67);
      expect(result).toBe('12,345.67');
    });

    it('handles very small decimal numbers', () => {
      const result = formatNumber(0.123);
      expect(result).toBe('0.123');
    });

    it('handles single digit numbers', () => {
      const result = formatNumber(5);
      expect(result).toBe('5');
    });

    it('handles numbers in thousands', () => {
      const result = formatNumber(1000);
      expect(result).toBe('1,000');
    });
  });

  describe('getValueColorClass', () => {
    const colorScheme = {
      POSITIVE: 'text-green-600',
      NEGATIVE: 'text-red-600',
    };

    it('returns positive color for positive numbers', () => {
      const result = getValueColorClass(100, colorScheme);
      expect(result).toBe('text-green-600');
    });

    it('returns negative color for negative numbers', () => {
      const result = getValueColorClass(-100, colorScheme);
      expect(result).toBe('text-red-600');
    });

    it('returns positive color for zero', () => {
      const result = getValueColorClass(0, colorScheme);
      expect(result).toBe('text-green-600');
    });

    it('returns positive color for very small positive numbers', () => {
      const result = getValueColorClass(0.01, colorScheme);
      expect(result).toBe('text-green-600');
    });

    it('returns negative color for very small negative numbers', () => {
      const result = getValueColorClass(-0.01, colorScheme);
      expect(result).toBe('text-red-600');
    });

    it('works with COLOR_SCHEME constant', () => {
      const result = getValueColorClass(100, COLOR_SCHEME);
      expect(result).toBe(COLOR_SCHEME.POSITIVE);
    });

    it('works with custom color schemes', () => {
      const customScheme = {
        POSITIVE: 'custom-positive',
        NEGATIVE: 'custom-negative',
      };
      const result = getValueColorClass(-50, customScheme);
      expect(result).toBe('custom-negative');
    });
  });

  describe('formatCurrencyWithSign', () => {
    it('returns empty sign for positive numbers', () => {
      const result = formatCurrencyWithSign(50000);
      expect(result.sign).toBe('');
      expect(result.formatted).toBe('₹50,000');
    });

    it('returns minus sign for negative numbers', () => {
      const result = formatCurrencyWithSign(-50000);
      expect(result.sign).toBe('-');
      expect(result.formatted).toBe('₹50,000');
    });

    it('returns empty sign for zero', () => {
      const result = formatCurrencyWithSign(0);
      expect(result.sign).toBe('');
      expect(result.formatted).toBe('₹0');
    });

    it('formats large positive numbers correctly', () => {
      const result = formatCurrencyWithSign(10000000);
      expect(result.sign).toBe('');
      expect(result.formatted).toBe('₹1,00,00,000');
    });

    it('formats large negative numbers correctly', () => {
      const result = formatCurrencyWithSign(-10000000);
      expect(result.sign).toBe('-');
      expect(result.formatted).toBe('₹1,00,00,000');
    });

    it('handles decimal numbers', () => {
      const result = formatCurrencyWithSign(12345.67);
      expect(result.sign).toBe('');
      expect(result.formatted).toBe('₹12,346');
    });

    it('handles negative decimal numbers', () => {
      const result = formatCurrencyWithSign(-12345.67);
      expect(result.sign).toBe('-');
      expect(result.formatted).toBe('₹12,346');
    });

    it('returns object with correct structure', () => {
      const result = formatCurrencyWithSign(100);
      expect(result).toHaveProperty('sign');
      expect(result).toHaveProperty('formatted');
      expect(typeof result.sign).toBe('string');
      expect(typeof result.formatted).toBe('string');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage with default 1 decimal place', () => {
      const result = formatPercentage(25.5);
      expect(result).toBe('25.5%');
    });

    it('formats percentage with custom decimal places', () => {
      const result = formatPercentage(25.567, 2);
      expect(result).toBe('25.57%');
    });

    it('formats percentage with zero decimal places', () => {
      const result = formatPercentage(25.567, 0);
      expect(result).toBe('26%');
    });

    it('formats whole numbers correctly', () => {
      const result = formatPercentage(100);
      expect(result).toBe('100.0%');
    });

    it('formats zero correctly', () => {
      const result = formatPercentage(0);
      expect(result).toBe('0.0%');
    });

    it('formats negative percentages', () => {
      const result = formatPercentage(-15.5);
      expect(result).toBe('-15.5%');
    });

    it('formats very small percentages', () => {
      const result = formatPercentage(0.123, 3);
      expect(result).toBe('0.123%');
    });

    it('formats very large percentages', () => {
      const result = formatPercentage(999.99, 2);
      expect(result).toBe('999.99%');
    });

    it('handles rounding correctly', () => {
      const result = formatPercentage(33.333, 1);
      expect(result).toBe('33.3%');
    });

    it('handles rounding up correctly', () => {
      const result = formatPercentage(33.567, 1);
      expect(result).toBe('33.6%');
    });

    it('formats with 3 decimal places', () => {
      const result = formatPercentage(12.3456, 3);
      expect(result).toBe('12.346%');
    });
  });

  describe('safeCurrencyFormat', () => {
    it('formats valid numbers correctly', () => {
      const result = safeCurrencyFormat(50000);
      expect(result).toBe('₹50,000');
    });

    it('returns default value for null', () => {
      const result = safeCurrencyFormat(null);
      expect(result).toBe('₹0');
    });

    it('returns default value for undefined', () => {
      const result = safeCurrencyFormat(undefined);
      expect(result).toBe('₹0');
    });

    it('returns default value for NaN', () => {
      const result = safeCurrencyFormat(NaN);
      expect(result).toBe('₹0');
    });

    it('formats zero correctly', () => {
      const result = safeCurrencyFormat(0);
      expect(result).toBe('₹0');
    });

    it('formats negative numbers correctly', () => {
      const result = safeCurrencyFormat(-50000);
      expect(result).toBe('₹50,000');
    });

    it('formats large numbers correctly', () => {
      const result = safeCurrencyFormat(10000000);
      expect(result).toBe('₹1,00,00,000');
    });

    it('formats decimal numbers correctly', () => {
      const result = safeCurrencyFormat(12345.67);
      expect(result).toBe('₹12,346');
    });

    it('handles very small positive numbers', () => {
      const result = safeCurrencyFormat(0.5);
      expect(result).toBe('₹1');
    });

    it('handles very small negative numbers', () => {
      const result = safeCurrencyFormat(-0.5);
      expect(result).toBe('₹1');
    });
  });

  describe('Edge Cases and Integration', () => {
    it('handles complete formatting workflow', () => {
      const value = 50000;
      
      // Format as currency
      const currency = formatCurrency(value);
      expect(currency).toBe('₹50,000');
      
      // Format as number
      const number = formatNumber(value);
      expect(number).toBe('50,000');
      
      // Get color class
      const colorClass = getValueColorClass(value, COLOR_SCHEME);
      expect(colorClass).toBe(COLOR_SCHEME.POSITIVE);
      
      // Format with sign
      const withSign = formatCurrencyWithSign(value);
      expect(withSign.sign).toBe('');
      expect(withSign.formatted).toBe('₹50,000');
    });

    it('handles negative value workflow', () => {
      const value = -50000;
      
      const currency = formatCurrency(value);
      expect(currency).toBe('₹50,000');
      
      const colorClass = getValueColorClass(value, COLOR_SCHEME);
      expect(colorClass).toBe(COLOR_SCHEME.NEGATIVE);
      
      const withSign = formatCurrencyWithSign(value);
      expect(withSign.sign).toBe('-');
      expect(withSign.formatted).toBe('₹50,000');
    });

    it('handles zero value workflow', () => {
      const value = 0;
      
      const currency = formatCurrency(value);
      expect(currency).toBe('₹0');
      
      const number = formatNumber(value);
      expect(number).toBe('0');
      
      const colorClass = getValueColorClass(value, COLOR_SCHEME);
      expect(colorClass).toBe(COLOR_SCHEME.POSITIVE);
      
      const withSign = formatCurrencyWithSign(value);
      expect(withSign.sign).toBe('');
    });

    it('handles null/undefined safely across functions', () => {
      const safeCurrency = safeCurrencyFormat(null);
      expect(safeCurrency).toBe('₹0');
      
      const safeCurrency2 = safeCurrencyFormat(undefined);
      expect(safeCurrency2).toBe('₹0');
    });

    it('formats Indian numbering system correctly for various amounts', () => {
      // Thousands
      expect(formatCurrency(1000)).toBe('₹1,000');
      
      // Ten thousands
      expect(formatCurrency(10000)).toBe('₹10,000');
      
      // Lakhs
      expect(formatCurrency(100000)).toBe('₹1,00,000');
      
      // Ten lakhs
      expect(formatCurrency(1000000)).toBe('₹10,00,000');
      
      // Crores
      expect(formatCurrency(10000000)).toBe('₹1,00,00,000');
    });

    it('handles percentage formatting for common use cases', () => {
      // Tax rate
      expect(formatPercentage(18, 0)).toBe('18%');
      
      // Profit margin
      expect(formatPercentage(15.5, 1)).toBe('15.5%');
      
      // Completion percentage
      expect(formatPercentage(66.67, 2)).toBe('66.67%');
      
      // Full completion
      expect(formatPercentage(100, 0)).toBe('100%');
    });

    it('handles color classification for financial data', () => {
      // Profit
      expect(getValueColorClass(50000, COLOR_SCHEME)).toBe(COLOR_SCHEME.POSITIVE);
      
      // Loss
      expect(getValueColorClass(-50000, COLOR_SCHEME)).toBe(COLOR_SCHEME.NEGATIVE);
      
      // Break-even
      expect(getValueColorClass(0, COLOR_SCHEME)).toBe(COLOR_SCHEME.POSITIVE);
    });

    it('handles currency with sign for display purposes', () => {
      // Positive revenue
      const revenue = formatCurrencyWithSign(100000);
      expect(`${revenue.sign}${revenue.formatted}`).toBe('₹1,00,000');
      
      // Negative cost
      const cost = formatCurrencyWithSign(-50000);
      expect(`${cost.sign}${cost.formatted}`).toBe('-₹50,000');
    });

    it('handles extreme values', () => {
      // Very large
      const large = formatCurrency(Number.MAX_SAFE_INTEGER);
      expect(large).toContain('₹');
      
      // Very small positive
      const small = formatCurrency(0.001);
      expect(small).toBe('₹0');
      
      // Very small negative
      const smallNeg = formatCurrency(-0.001);
      expect(smallNeg).toBe('₹0');
    });

    it('maintains consistency across all formatters', () => {
      const testValue = 123456.789;
      
      // All formatters should handle the same value consistently
      const currency = formatCurrency(testValue);
      expect(currency).toContain('₹');
      
      const number = formatNumber(testValue);
      expect(number).toContain(',');
      
      const safe = safeCurrencyFormat(testValue);
      expect(safe).toBe(currency);
      
      const withSign = formatCurrencyWithSign(testValue);
      expect(withSign.formatted).toBe(currency);
    });
  });
});
