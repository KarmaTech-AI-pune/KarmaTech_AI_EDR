import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
  getVarianceColor,
  getVarianceText,
} from './formatters';

describe('formatCurrency', () => {
  it('formats millions', () => {
    expect(formatCurrency(5000000)).toBe('$5.0M');
  });

  it('formats thousands', () => {
    expect(formatCurrency(5000)).toBe('$5K');
  });

  it('formats small amounts', () => {
    expect(formatCurrency(500)).toBe('$500');
  });

  it('returns "0" for null', () => {
    expect(formatCurrency(null)).toBe('0');
  });

  it('returns "0" for undefined', () => {
    expect(formatCurrency(undefined)).toBe('0');
  });

  it('returns "0" for NaN', () => {
    expect(formatCurrency(NaN)).toBe('0');
  });

  it('formats exactly 1 million', () => {
    expect(formatCurrency(1000000)).toBe('$1.0M');
  });

  it('formats exactly 1 thousand', () => {
    expect(formatCurrency(1000)).toBe('$1K');
  });
});

describe('formatPercentage', () => {
  it('formats a percentage value', () => {
    expect(formatPercentage(85)).toBe('85%');
  });

  it('formats zero', () => {
    expect(formatPercentage(0)).toBe('0%');
  });

  it('formats negative value', () => {
    expect(formatPercentage(-10)).toBe('-10%');
  });
});

describe('formatNumber', () => {
  it('formats a number with locale separators', () => {
    expect(formatNumber(1000)).toBe('1,000');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('getVarianceColor', () => {
  it('returns "success" for positive variance', () => {
    expect(getVarianceColor(5)).toBe('success');
  });

  it('returns "error" for negative variance', () => {
    expect(getVarianceColor(-3)).toBe('error');
  });

  it('returns "default" for zero variance', () => {
    expect(getVarianceColor(0)).toBe('default');
  });
});

describe('getVarianceText', () => {
  it('formats positive variance with + sign', () => {
    expect(getVarianceText(10)).toBe('+10%');
  });

  it('formats negative variance', () => {
    expect(getVarianceText(-5)).toBe('-5%');
  });

  it('formats zero variance', () => {
    expect(getVarianceText(0)).toBe('0%');
  });
});
