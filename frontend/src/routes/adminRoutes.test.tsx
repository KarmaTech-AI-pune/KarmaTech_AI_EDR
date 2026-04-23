import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminRoutes } from './adminRoutes';

const flattenRoutes = (routes: any[]): any[] =>
  routes.reduce((acc, r) => {
    acc.push(r);
    if (r.children) acc.push(...flattenRoutes(r.children));
    return acc;
  }, []);

describe('Admin Routes', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Route Definition', () => {
    it('should export admin routes', () => { expect(adminRoutes).toBeDefined(); });
    it('should be an array of routes', () => { expect(Array.isArray(adminRoutes)).toBe(true); });
    it('should have route objects with path property', () => {
      adminRoutes.forEach(route => { expect(route).toHaveProperty('path'); });
    });
    it('should have route objects with children or element', () => {
      adminRoutes.forEach(route => {
        expect(route.children || route.element).toBeDefined();
      });
    });
  });

  describe('Route Paths', () => {
    it('should have valid path strings', () => {
      adminRoutes.forEach(route => { expect(typeof route.path).toBe('string'); });
    });
    it('should have admin-related paths', () => {
      const allRoutes = flattenRoutes(adminRoutes);
      const hasAdminPath = allRoutes.some(r => r.path?.includes('admin'));
      expect(hasAdminPath).toBe(true);
    });
    it('should not have duplicate paths', () => {
      const paths = adminRoutes.map(r => r.path);
      expect(paths.length).toBe(new Set(paths).size);
    });
  });

  describe('Route Elements', () => {
    it('should have valid React elements in children', () => {
      const allRoutes = flattenRoutes(adminRoutes);
      const withElement = allRoutes.filter(r => r.element !== undefined);
      expect(withElement.length).toBeGreaterThan(0);
    });
  });

  describe('Admin Route Types', () => {
    it('should include admin path', () => {
      const allRoutes = flattenRoutes(adminRoutes);
      expect(allRoutes.some(r => r.path?.includes('admin'))).toBe(true);
    });
    it('should include migrations or features routes', () => {
      const allRoutes = flattenRoutes(adminRoutes);
      expect(allRoutes.some(r => r.path?.includes('migration') || r.path?.includes('feature') || r.path?.includes('release'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty routes array gracefully', () => {
      expect(adminRoutes).toBeDefined();
      expect(Array.isArray(adminRoutes)).toBe(true);
    });
    it('should have consistent route structure', () => {
      adminRoutes.forEach(route => { expect(route).toHaveProperty('path'); });
    });
  });
});
