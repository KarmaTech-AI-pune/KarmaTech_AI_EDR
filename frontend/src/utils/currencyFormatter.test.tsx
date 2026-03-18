import { describe, it, expect } from 'vitest';
import {
  formatIndianCurrencyLive,
  cleanCurrencyInput,
  validateCurrencyInput,
  parseCurrencyToNumber,
} from './currencyFormatter';

describe('formatIndianCurrencyLive', () => {
  it('returns empty string for empty input', () => {
    expect(formatIndianCurrencyLive('')).toBe('');
  });

  it('formats a simple number', () => {
    expect(formatIndianCurrencyLive('1000')).toBe('1,000');
  });

  it('formats large number with Indian grouping', () => {
    expect(formatIndianCurrencyLive('100000')).toBe('1,00,000');
  });

  it('preserves decimal part as-is', () => {
    expect(formatIndianCurrencyLive('1000.5')).toBe('1,000.5');
  });

  it('preserves trailing dot for typing', () => {
    expect(formatIndianCurrencyLive('1000.')).toBe('1,000.');
  });

  it('handles single digit', () => {
    expect(formatIndianCurrencyLive('5')).toBe('5');
  });

  it('handles zero', () => {
    expect(formatIndianCurrencyLive('0')).toBe('0');
  });
});

describe('cleanCurrencyInput', () => {
  it('removes commas from formatted number', () => {
    expect(cleanCurrencyInput('1,00,000')).toBe('100000');
  });

  it('keeps decimal point and digits', () => {
    expect(cleanCurrencyInput('1,234.56')).toBe('1234.56');
  });

  it('returns empty string for empty input', () => {
    expect(cleanCurrencyInput('')).toBe('');
  });
});

describe('validateCurrencyInput', () => {
  it('accepts integer input', () => {
    expect(validateCurrencyInput('1000')).toBe(true);
  });

  it('accepts input with up to 2 decimal places', () => {
    expect(validateCurrencyInput('1000.99')).toBe(true);
  });

  it('rejects input with 3 decimal places', () => {
    expect(validateCurrencyInput('1000.999')).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(validateCurrencyInput('abc')).toBe(false);
  });

  it('rejects multiple decimal points', () => {
    expect(validateCurrencyInput('10.5.5')).toBe(false);
  });

  it('accepts empty string', () => {
    expect(validateCurrencyInput('')).toBe(true);
  });

  it('accepts single decimal point', () => {
    expect(validateCurrencyInput('100.')).toBe(true);
  });
});

describe('parseCurrencyToNumber', () => {
  it('parses formatted Indian number', () => {
    expect(parseCurrencyToNumber('1,00,000')).toBe(100000);
  });

  it('parses number with decimals', () => {
    expect(parseCurrencyToNumber('1,234.56')).toBe(1234.56);
  });

  it('returns 0 for empty string', () => {
    expect(parseCurrencyToNumber('')).toBe(0);
  });

  it('returns 0 for invalid input', () => {
    expect(parseCurrencyToNumber('invalid')).toBe(0);
  });

  it('parses plain number string', () => {
    expect(parseCurrencyToNumber('500')).toBe(500);
  });
});
