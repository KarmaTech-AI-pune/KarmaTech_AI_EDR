import { describe, it, expect } from 'vitest';
import {
  addCalculation,
  multiplyCalculation,
  percentageCalculation,
  calculateGrossPercentage,
  getPercentage,
} from './calculations';

describe('calculations', () => {
  describe('addCalculation', () => {
    it('should add two numbers correctly', () => {
      expect(addCalculation(1, 2)).toBe(3);
    });

    it('should add multiple numbers correctly', () => {
      expect(addCalculation(1, 2, 3, 4, 5)).toBe(15);
    });

    it('should return 0 for no numbers', () => {
      expect(addCalculation()).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(addCalculation(10, -5, 2)).toBe(7);
    });

    it('should handle decimal numbers', () => {
      expect(addCalculation(0.1, 0.2, 0.3)).toBeCloseTo(0.6);
    });
  });

  describe('multiplyCalculation', () => {
    it('should multiply two numbers correctly', () => {
      expect(multiplyCalculation(2, 3)).toBe(6);
    });

    it('should multiply multiple numbers correctly', () => {
      expect(multiplyCalculation(1, 2, 3, 4)).toBe(24);
    });

    it('should return 0 if no numbers are provided', () => {
      expect(multiplyCalculation()).toBe(0);
    });

    it('should return 0 if any number is 0', () => {
      expect(multiplyCalculation(1, 2, 0, 4)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(multiplyCalculation(2, -3, 4)).toBe(-24);
    });

    it('should handle decimal numbers', () => {
      expect(multiplyCalculation(0.5, 2.5)).toBeCloseTo(1.25);
    });
  });

  describe('percentageCalculation', () => {
    it('should calculate percentage correctly with default decimal places', () => {
      expect(percentageCalculation(50, 100)).toBe(50);
      expect(percentageCalculation(25, 200)).toBe(50);
    });

    it('should calculate percentage with specified decimal places', () => {
      expect(percentageCalculation(33.333, 100, 2)).toBe(33.33);
      expect(percentageCalculation(10, 30, 3)).toBe(3);
    });

    it('should return 0 if percent is 0', () => {
      expect(percentageCalculation(0, 100)).toBe(0);
    });

    it('should handle large numbers', () => {
      expect(percentageCalculation(10, 1000000)).toBe(100000);
    });
  });

  describe('calculateGrossPercentage', () => {
    it('should calculate gross percentage correctly', () => {
      expect(calculateGrossPercentage(100, 80)).toBe(20);
      expect(calculateGrossPercentage(200, 150)).toBe(25);
    });

    it('should handle zero net fee', () => {
      expect(calculateGrossPercentage(0, 50)).toBe(0);
    });

    it('should handle negative profit (loss)', () => {
      expect(calculateGrossPercentage(100, 120)).toBe(-20);
    });

    it('should handle specified decimal places', () => {
      expect(calculateGrossPercentage(300, 200, 3)).toBe(33.333);
    });
  });

  describe('getPercentage', () => {
    it('should calculate percentage of value relative to total correctly', () => {
      expect(getPercentage(50, 100)).toBe(50);
      expect(getPercentage(25, 200)).toBe(12.5);
    });

    it('should return 0 if total is 0', () => {
      expect(getPercentage(50, 0)).toBe(0);
    });

    it('should handle specified decimal places', () => {
      expect(getPercentage(1, 3, 2)).toBe(33.33);
      expect(getPercentage(1, 3, 0)).toBe(33);
    });

    it('should handle value greater than total', () => {
      expect(getPercentage(150, 100)).toBe(150);
    });
  });
});
