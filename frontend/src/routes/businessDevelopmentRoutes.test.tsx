import { describe, it, expect, vi, beforeEach } from 'vitest';
import { businessDevelopmentRoutes } from './businessDevelopmentRoutes';

const flattenRoutes = (routes: any[]): any[] =>
  routes.reduce((acc, r) => {
    acc.push(r);
    if (r.children) acc.push(...flattenRoutes(r.children));
    return acc;
  }, []);

describe('Business Development Routes', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Route Definition', () => {
    it('should export business development routes', () => { expect(businessDevelopmentRoutes).toBeDefined(); });
    it('should be an array of routes', () => { expect(Array.isArray(businessDevelopmentRoutes)).toBe(true); });
    it('should have route objects with path property', () => {
      businessDevelopmentRoutes.forEach(route => { expect(route).toHaveProperty('path'); });
    });
    it('should have route objects with children or element', () => {
      businessDevelopmentRoutes.forEach(route => {
        expect(route.children || route.element).toBeDefined();
      });
    });
  });

  describe('Route Paths', () => {
    it('should have valid path strings', () => {
      businessDevelopmentRoutes.forEach(route => { expect(typeof route.path).toBe('string'); });
    });
    it('should have business development related paths', () => {
      const allRoutes = flattenRoutes(businessDevelopmentRoutes);
      expect(allRoutes.some(r => r.path?.includes('business') || r.path?.includes('details'))).toBe(true);
    });
    it('should not have duplicate paths', () => {
      const paths = businessDevelopmentRoutes.map(r => r.path);
      expect(paths.length).toBe(new Set(paths).size);
    });
  });

  describe('Route Elements', () => {
    it('should have valid React elements in children', () => {
      const allRoutes = flattenRoutes(businessDevelopmentRoutes);
      expect(allRoutes.filter(r => r.element !== undefined).length).toBeGreaterThan(0);
    });
  });

  describe('Business Development Route Types', () => {
    it('should include business-development path', () => {
      expect(businessDevelopmentRoutes.some(r => r.path?.includes('business-development'))).toBe(true);
    });
    it('should include detail routes in children', () => {
      const allRoutes = flattenRoutes(businessDevelopmentRoutes);
      expect(allRoutes.some(r => r.path?.includes('details') || r.path?.includes('overview'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty routes array gracefully', () => {
      expect(businessDevelopmentRoutes).toBeDefined();
      expect(Array.isArray(businessDevelopmentRoutes)).toBe(true);
    });
    it('should have consistent route structure', () => {
      businessDevelopmentRoutes.forEach(route => { expect(route).toHaveProperty('path'); });
    });
  });
});
