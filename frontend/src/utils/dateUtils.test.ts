import { describe, it, expect} from 'vitest';
import { formatDateForInput, parseDateFromInput, getMonthName } from './dateUtils';

describe('dateUtils', () => {
  describe('formatDateForInput', () => {
    it('should format a Date object to YYYY-MM-DD', () => {
      const date = new Date('2023-01-15T10:00:00Z');
      // Mock getTimezoneOffset to ensure consistent testing regardless of local timezone
      const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
      Date.prototype.getTimezoneOffset = () => 0; // Assume UTC for testing

      expect(formatDateForInput(date)).toBe('2023-01-15');

      Date.prototype.getTimezoneOffset = originalGetTimezoneOffset; // Restore original
    });

    it('should format a date string to YYYY-MM-DD', () => {
      const dateString = '2023-03-20T14:30:00Z';
      const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
      Date.prototype.getTimezoneOffset = () => 0;

      expect(formatDateForInput(dateString)).toBe('2023-03-20');

      Date.prototype.getTimezoneOffset = originalGetTimezoneOffset;
    });

    it('should return an empty string for null input', () => {
      expect(formatDateForInput(null)).toBe('');
    });

    it('should return an empty string for undefined input', () => {
      expect(formatDateForInput(undefined)).toBe('');
    });

    it('should return an empty string for an invalid date string', () => {
      expect(formatDateForInput('invalid-date')).toBe('');
    });

    it('should handle dates that cross day boundaries due to timezone offset', () => {
      // The function adjusts for timezone offset to prevent off-by-one-day errors
      const date = new Date('2023-01-01T02:00:00Z'); // UTC time
      const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
      
      // Simulate a timezone where 2 AM UTC is previous day locally (e.g., UTC-5)
      Date.prototype.getTimezoneOffset = () => 5 * 60; // 5 hours offset (UTC-5)
      
      const result = formatDateForInput(date);
      
      // The actual behavior: with a negative timezone offset (UTC-5),
      // the function adjusts the time, which can result in the previous day
      // This is the current behavior of the function
      expect(result).toBe('2022-12-31');

      Date.prototype.getTimezoneOffset = originalGetTimezoneOffset;
    });
  });

  describe('parseDateFromInput', () => {
    it('should parse a YYYY-MM-DD string to an ISO string', () => {
      const dateString = '2023-01-15';
      const expectedDate = new Date('2023-01-15T00:00:00.000Z');
      // Mock getTimezoneOffset to ensure consistent testing regardless of local timezone
      const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
      Date.prototype.getTimezoneOffset = () => 0; // Assume UTC for testing

      // When parsing 'YYYY-MM-DD', new Date() creates a date at midnight local time.
      // .toISOString() then converts it to UTC.
      // So, '2023-01-15' in a UTC+5:30 timezone would be '2023-01-14T18:30:00.000Z'
      // To make tests consistent, we'll mock the timezone offset to 0.
      expect(parseDateFromInput(dateString)).toBe(expectedDate.toISOString());

      Date.prototype.getTimezoneOffset = originalGetTimezoneOffset;
    });

    it('should return null for an empty string', () => {
      expect(parseDateFromInput('')).toBeNull();
    });

    it('should return null for an invalid date string', () => {
      expect(parseDateFromInput('invalid-date')).toBeNull();
    });
  });

  describe('getMonthName', () => {
    it('should return the full month name for a valid month number string', () => {
      expect(getMonthName('1')).toBe('January');
      expect(getMonthName('12')).toBe('December');
      expect(getMonthName('07')).toBe('July');
    });

    it('should return the original string if it is not a valid month number', () => {
      expect(getMonthName('January')).toBe('January');
      expect(getMonthName('13')).toBe('13');
      expect(getMonthName('0')).toBe('0');
      expect(getMonthName('abc')).toBe('abc');
    });
  });
});
