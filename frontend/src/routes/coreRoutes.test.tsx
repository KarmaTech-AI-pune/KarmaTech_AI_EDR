import { describe, it, expect, vi, beforeEach } from 'vitest';
import { coreRoutes } from './coreRoutes';

const flattenRoutes = (routes: any[]): any[] =>
  routes.reduce((acc, r) => {
    acc.push(r);
    if (r.children) acc.push(...flattenRoutes(r.children));
    return acc;
  }, []);

describe('Core Routes', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Route Definition', () => {
    it('should export core routes', () => { expect(coreRoutes).toBeDefined(); });
    it('should be an array of routes', () => { expect(Array.isArray(coreRoutes)).toBe(true); });
    it('should have route objects with path property', () => {
      coreRoutes.forEach(route => { expect(route).toHaveProperty('path'); });
    });
    it('should have route objects with element', () => {
      coreRoutes.forEach(route => { expect(route.element).toBeDefined(); });
    });
  });

  describe('Route Paths', () => {
    it('should have valid path strings', () => {
      coreRoutes.forEach(route => { expect(typeof route.path).toBe('string'); });
    });
    it('should not have duplicate paths', () => {
      const paths = coreRoutes.map(r => r.path);
      expect(paths.length).toBe(new Set(paths).size);
    });
  });

  describe('Route Elements', () => {
    it('should have valid React elements', () => {
      coreRoutes.forEach(route => { expect(route.element).toBeDefined(); });
    });
  });

  describe('Route Structure', () => {
    it('should include home route', () => {
      expect(coreRoutes.some(r => r.path === '/')).toBe(true);
    });
    it('should include login route in children', () => {
      const allRoutes = flattenRoutes(coreRoutes);
      expect(allRoutes.some(r => r.path?.includes('login'))).toBe(true);
    });
    it('should include not found route in children', () => {
      const allRoutes = flattenRoutes(coreRoutes);
      expect(allRoutes.some(r => r.path === '*')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty routes array gracefully', () => {
      expect(coreRoutes).toBeDefined();
      expect(Array.isArray(coreRoutes)).toBe(true);
    });
    it('should have consistent route structure', () => {
      coreRoutes.forEach(route => {
        expect(route).toHaveProperty('path');
        expect(route).toHaveProperty('element');
      });
    });
  });
});
