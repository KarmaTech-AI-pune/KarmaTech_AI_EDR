import { describe, it, expect } from 'vitest';
import { 
  FORM_FEATURE_MAP, 
  getValidFormIds, 
  isValidFormId, 
  getFormFeatureName 
} from '../formFeatureMapping';

describe('formFeatureMapping', () => {
  describe('FORM_FEATURE_MAP', () => {
    it('should contain mapped forms', () => {
      expect(FORM_FEATURE_MAP).toBeDefined();
      expect(FORM_FEATURE_MAP['dashboard']).toBe('Dashboard');
      expect(FORM_FEATURE_MAP['program']).toBe('Program Management');
    });
  });

  describe('getValidFormIds', () => {
    it('should return an array of keys from FORM_FEATURE_MAP', () => {
      const validIds = getValidFormIds();
      expect(Array.isArray(validIds)).toBe(true);
      expect(validIds.length).toBeGreaterThan(0);
      expect(validIds).toContain('dashboard');
      expect(validIds).toContain('wbs');
      expect(validIds.every(id => id in FORM_FEATURE_MAP)).toBe(true);
    });
  });

  describe('isValidFormId', () => {
    it('should return true for valid form id', () => {
      expect(isValidFormId('dashboard')).toBe(true);
      expect(isValidFormId('wbs-manpower')).toBe(true);
    });

    it('should return false for invalid form id', () => {
      expect(isValidFormId('invalid-form-id')).toBe(false);
      expect(isValidFormId('')).toBe(false);
    });
  });

  describe('getFormFeatureName', () => {
    it('should return the correct feature name for a valid form id', () => {
      expect(getFormFeatureName('dashboard')).toBe('Dashboard');
      expect(getFormFeatureName('wbs-todo-list')).toBe('Sprint Planning');
      expect(getFormFeatureName('change-control')).toBe('Change Control');
    });

    it('should return undefined for an invalid form id', () => {
      expect(getFormFeatureName('invalid-form-id')).toBeUndefined();
    });
  });
});
