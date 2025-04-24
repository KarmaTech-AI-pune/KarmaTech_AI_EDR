/**
 * Utility functions for calculations
 */

/**
 * Adds together all provided numbers
 * @param numbers - Array of numbers to add
 * @returns The sum of all provided numbers
 */
export const addCalculation = (...numbers: number[]): number => {
  return numbers.reduce((sum, num) => sum + num, 0);
};

/**
 * Multiplies all provided numbers together
 * @param numbers - Array of numbers to multiply
 * @returns The product of all provided numbers
 */
export const multiplyCalculation = (...numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((product, num) => product * num, 1);
};

/**
 * Calculates the percentage of a value relative to a total
 * @param value - The value to calculate percentage for
 * @param total - The total value (100%)
 * @param decimalPlaces - Optional number of decimal places (default: 2)
 * @returns The percentage value
 */
export const percentageCalculation = (value: number, total: number, decimalPlaces: number = 2): number => {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return Number(percentage.toFixed(decimalPlaces));
};

/**
 * Example usage:
 * const sum = addCalculation(1, 2, 3, 4); // returns 10
 * const product = multiplyCalculation(2, 3, 4); // returns 24
 * const percent = percentageCalculation(25, 100); // returns 25.00
 * const percent2 = percentageCalculation(1, 3, 1); // returns 33.3
 */ 