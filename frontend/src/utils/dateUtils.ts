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

  if (typeof date === 'string') {
    // If it's already in DD-MM-YYYY format, convert to YYYY-MM-DD for native <input type="date">
    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      const [day, month, year] = date.split('-');
      return `${year}-${month}-${day}`;
    }
  }

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
    const parts = dateString.split('-');
    // Assuming native input gives YYYY-MM-DD
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    // Fallback if date is not YYYY-MM-DD
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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

export const formatDateToDDMMYYYY = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;

  if (typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
    return date;
  }

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return null;
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    return null;
  }
};
