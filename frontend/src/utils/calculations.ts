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
export const percentageCalculation = (percent: number, total: number, decimalPlaces: number = 2): number => {
  if (percent === 0) return 0;
  const percentage = (percent * total) / 100;
  return Number(percentage.toFixed(decimalPlaces));
};


/**
 * Calculates the gross profit percentage given a net fee and total EAC.
 * @param net - The net fee.
 * @param totalEAC - The total EAC.
 * @param decimalPlaces - Optional number of decimal places (default: 2).
 * @returns The gross profit percentage.
 */
export const calculateGrossPercentage = (net: number, value: number, decimalPlaces: number = 2): number => {
  if (net === 0) return 0; // Avoid division by zero
  const grossProfit = ((net - value) / net) * 100;
  return Number(grossProfit.toFixed(decimalPlaces));
};


/**
 * Calculates the percentage of a value relative to a total
 * @param value - The value to calculate percentage for
 * @param total - The total value (100%)
 * @param decimalPlaces - Optional number of decimal places (default: 2)
 * @returns The percentage value
 */
export const getPercentage = (value: number, total: number, decimalPlaces: number = 2): number => {
    if (total === 0) return 0;
    const percentage = (value / total) * 100;
    return Number(percentage.toFixed(decimalPlaces));
};
