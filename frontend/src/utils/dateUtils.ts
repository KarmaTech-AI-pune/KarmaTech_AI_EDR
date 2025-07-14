/**
 * Formats a Date object or a date string into 'YYYY-MM-DD' format.
 * This function correctly handles timezone offsets to prevent off-by-one-day errors
 * when displaying dates in a date input field.
 *
 * @param date - The date to format, can be a Date object, a string, or null/undefined.
 * @returns The formatted date string in 'YYYY-MM-DD' format, or an empty string if the input is invalid.
 */
export const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';

  try {
    const d = new Date(date);
    // Check if the date is valid
    if (isNaN(d.getTime())) {
      return '';
    }
    // Adjust for timezone offset to ensure the correct date is displayed
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return '';
  }
};

/**
 * Parses a date string from an input field ('YYYY-MM-DD') into a Date object.
 * Returns null if the input string is empty or invalid.
 *
 * @param dateString - The date string to parse.
 * @returns A Date object or null.
 */
export const parseDateFromInput = (dateString: string): string | null => {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    // To keep the date consistent and avoid timezone issues, convert it to an ISO string.
    // The backend should be prepared to handle this format.
    return date.toISOString();
  } catch (error) {
    console.error("Error parsing date string:", error);
    return null;
  }
};

export const getMonthName = (month: string): string => {
  const monthNumber = parseInt(month, 10);
  if (!isNaN(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  }
  return month; // Return original string if it's not a number 1-12
};
