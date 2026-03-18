import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { FallbackDataProvider } from './fallbackData';

describe('FallbackDataProvider', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getResourceRoles', () => {
    it('returns an array of resource roles', () => {
      const roles = FallbackDataProvider.getResourceRoles();
      expect(Array.isArray(roles)).toBe(true);
    });

    it('logs a warning', () => {
      FallbackDataProvider.getResourceRoles();
      expect(console.warn).toHaveBeenCalledWith('Using fallback data for resource roles');
    });
  });

  describe('getEmployees', () => {
    it('returns an array of employees', () => {
      const employees = FallbackDataProvider.getEmployees();
      expect(Array.isArray(employees)).toBe(true);
    });

    it('logs a warning', () => {
      FallbackDataProvider.getEmployees();
      expect(console.warn).toHaveBeenCalledWith('Using fallback data for employees');
    });
  });

  describe('getEmployeeById', () => {
    it('returns undefined for non-existent ID', () => {
      const result = FallbackDataProvider.getEmployeeById('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('returns an employee if ID matches', () => {
      const employees = FallbackDataProvider.getEmployees();
      if (employees.length > 0) {
        const found = FallbackDataProvider.getEmployeeById(employees[0].id);
        expect(found).toBeDefined();
        expect(found?.id).toBe(employees[0].id);
      }
    });

    it('logs a warning with the ID', () => {
      FallbackDataProvider.getEmployeeById('test-id');
      expect(console.warn).toHaveBeenCalledWith('Using fallback data for employee with ID test-id');
    });
  });

  describe('getProjectWBS', () => {
    it('returns an array', () => {
      const wbs = FallbackDataProvider.getProjectWBS('1');
      expect(Array.isArray(wbs)).toBe(true);
    });

    it('logs a warning', () => {
      FallbackDataProvider.getProjectWBS('1');
      expect(console.warn).toHaveBeenCalledWith('Using fallback data for WBS of project 1');
    });
  });

  describe('getAllWBSOptions', () => {
    it('returns WBS options', () => {
      const options = FallbackDataProvider.getAllWBSOptions();
      expect(options).toBeDefined();
    });
  });

  describe('getLevel1Options', () => {
    it('returns level 1 options', () => {
      const options = FallbackDataProvider.getLevel1Options();
      expect(options).toBeDefined();
    });
  });

  describe('getLevel2Options', () => {
    it('returns level 2 options', () => {
      const options = FallbackDataProvider.getLevel2Options();
      expect(options).toBeDefined();
    });
  });

  describe('getLevel3Options', () => {
    it('returns level 3 options for a given level 2 value', () => {
      const options = FallbackDataProvider.getLevel3Options('test');
      expect(options).toBeDefined();
    });
  });

  describe('getMonthlyHoursByProjectId', () => {
    it('returns an array', () => {
      const hours = FallbackDataProvider.getMonthlyHoursByProjectId('1');
      expect(Array.isArray(hours)).toBe(true);
    });

    it('logs a warning', () => {
      FallbackDataProvider.getMonthlyHoursByProjectId('1');
      expect(console.warn).toHaveBeenCalledWith('Using fallback data for monthly hours of project 1');
    });
  });
});
