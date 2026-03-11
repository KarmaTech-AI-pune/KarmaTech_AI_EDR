import { describe, it, expect } from 'vitest';
import {
  formatToIndianNumber,
  formatToIndianCurrency,
  parseIndianNumber,
  formatForInput,
  formatForDisplay,
  formatIndianNumber,
} from './numberFormatting';

describe('formatToIndianNumber', () => {
  it('formats a number with Indian grouping and 2 decimals', () => {
    expect(formatToIndianNumber(100000)).toBe('1,00,000.00');
  });

  it('returns empty string for null', () => {
    expect(formatToIndianNumber(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatToIndianNumber(undefined)).toBe('');
  });

  it('returns empty string for NaN', () => {
    expect(formatToIndianNumber(NaN)).toBe('');
  });

  it('formats zero', () => {
    expect(formatToIndianNumber(0)).toBe('0.00');
  });

  it('formats decimal numbers', () => {
    expect(formatToIndianNumber(1234.5)).toBe('1,234.50');
  });
});

describe('formatToIndianCurrency', () => {
  it('formats with default ₹ symbol', () => {
    expect(formatToIndianCurrency(100000)).toBe('₹ 1,00,000.00');
  });

  it('formats with custom currency symbol', () => {
    expect(formatToIndianCurrency(1000, '$')).toBe('$ 1,000.00');
  });

  it('returns empty string for null', () => {
    expect(formatToIndianCurrency(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatToIndianCurrency(undefined)).toBe('');
  });
});

describe('parseIndianNumber', () => {
  it('parses formatted Indian number', () => {
    expect(parseIndianNumber('1,00,000')).toBe(100000);
  });

  it('parses currency string with symbol', () => {
    expect(parseIndianNumber('₹ 1,234.56')).toBe(1234.56);
  });

  it('returns 0 for empty string', () => {
    expect(parseIndianNumber('')).toBe(0);
  });

  it('returns 0 for non-string input', () => {
    expect(parseIndianNumber(null as any)).toBe(0);
  });

  it('returns 0 for invalid string', () => {
    expect(parseIndianNumber('abc')).toBe(0);
  });
});

describe('formatForInput', () => {
  it('returns string representation of number', () => {
    expect(formatForInput(1234)).toBe('1234');
  });

  it('returns empty string for null', () => {
    expect(formatForInput(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatForInput(undefined)).toBe('');
  });

  it('returns empty string for NaN', () => {
    expect(formatForInput(NaN)).toBe('');
  });
});

describe('formatForDisplay', () => {
  it('delegates to formatToIndianNumber', () => {
    expect(formatForDisplay(100000)).toBe('1,00,000.00');
  });

  it('returns empty string for null', () => {
    expect(formatForDisplay(null)).toBe('');
  });
});

describe('formatIndianNumber', () => {
  it('formats a number', () => {
    expect(formatIndianNumber(100000)).toBe('1,00,000');
  });

  it('returns empty string for undefined', () => {
    expect(formatIndianNumber(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatIndianNumber('')).toBe('');
  });

  it('handles intermediate typing state "-"', () => {
    expect(formatIndianNumber('-')).toBe('-');
  });

  it('handles intermediate typing state "."', () => {
    expect(formatIndianNumber('.')).toBe('.');
  });

  it('formats a string number', () => {
    expect(formatIndianNumber('50000')).toBe('50,000');
  });

  it('returns empty string for non-numeric string', () => {
    expect(formatIndianNumber('abc')).toBe('');
  });
});
