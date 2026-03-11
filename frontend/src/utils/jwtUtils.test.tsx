import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getEnabledFeaturesFromToken,
  hasFeature,
  getTenantIdFromStorage,
} from './jwtUtils';

describe('jwtUtils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  describe('getEnabledFeaturesFromToken', () => {
    it('returns features from stored user', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify({ features: ['dashboard', 'reports'] })
      );
      expect(getEnabledFeaturesFromToken()).toEqual(['dashboard', 'reports']);
    });

    it('returns empty array when no user in storage', () => {
      expect(getEnabledFeaturesFromToken()).toEqual([]);
    });

    it('returns empty array when user has no features', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify({ name: 'Test' })
      );
      expect(getEnabledFeaturesFromToken()).toEqual([]);
    });

    it('returns empty array when storage has invalid JSON', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('not-json');
      expect(getEnabledFeaturesFromToken()).toEqual([]);
    });
  });

  describe('hasFeature', () => {
    it('returns true when user has the feature', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify({ features: ['Dashboard', 'Reports'] })
      );
      expect(hasFeature('dashboard')).toBe(true);
    });

    it('returns false when user does not have the feature', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify({ features: ['Reports'] })
      );
      expect(hasFeature('dashboard')).toBe(false);
    });

    it('returns true for wildcard (super admin)', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify({ features: ['*'] })
      );
      expect(hasFeature('anything')).toBe(true);
    });

    it('performs case-insensitive comparison', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify({ features: ['DASHBOARD'] })
      );
      expect(hasFeature('dashboard')).toBe(true);
    });

    it('returns false when no user in storage', () => {
      expect(hasFeature('dashboard')).toBe(false);
    });
  });

  describe('getTenantIdFromStorage', () => {
    it('returns tenant ID from stored user', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify({ tenantId: 42 })
      );
      expect(getTenantIdFromStorage()).toBe(42);
    });

    it('returns null when no user in storage', () => {
      expect(getTenantIdFromStorage()).toBeNull();
    });

    it('returns null when user has no tenantId', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify({ name: 'Test' })
      );
      expect(getTenantIdFromStorage()).toBeNull();
    });
  });
});
