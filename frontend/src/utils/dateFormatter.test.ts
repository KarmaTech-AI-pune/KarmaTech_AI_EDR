import { describe, it, expect } from 'vitest';

// Helper function to format date as dd-MM-yyyy
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return 'N/A';
  }
};

describe('formatDate', () => {
  it('formats ISO date string to dd-MM-yyyy', () => {
    expect(formatDate('2025-01-20T00:00:00Z')).toBe('20-01-2025');
    expect(formatDate('2025-12-31T00:00:00Z')).toBe('31-12-2025');
    expect(formatDate('2025-03-15T00:00:00Z')).toBe('15-03-2025');
  });

  it('formats simple date string to dd-MM-yyyy', () => {
    expect(formatDate('2025-01-20')).toBe('20-01-2025');
    expect(formatDate('2025-12-31')).toBe('31-12-2025');
  });

  it('handles null values', () => {
    expect(formatDate(null)).toBe('N/A');
  });

  it('handles invalid date strings', () => {
    expect(formatDate('invalid-date')).toBe('N/A');
    expect(formatDate('')).toBe('N/A');
  });

  it('pads single digit days and months with zero', () => {
    expect(formatDate('2025-01-05')).toBe('05-01-2025');
    expect(formatDate('2025-09-09')).toBe('09-09-2025');
  });
});
