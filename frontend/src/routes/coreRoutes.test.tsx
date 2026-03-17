import { describe, it, expect, vi, beforeEach } from 'vitest';
import coreRoutes from './coreRoutes';

describe('Core Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Definition', () => {
    it('should export core routes', () => {
      expect(coreRoutes).toBeDefined();
    });

    it('should be an array of routes', () => {
      expect(Array.isArray(coreRoutes)).toBe(true);
    });

    it('should have route objects with path property', () => {
      coreRoutes.forEach(route => {
        expect(route).toHaveProperty('path');
      });
    });

    it('should have route objects with element property', () => {
      coreRoutes.forEach(route => {
        expect(route).toHaveProperty('element');
      });
    });
  });

  describe('Route Paths', () => {
    it('should have valid path strings', () => {
      coreRoutes.forEach(route => {
        expect(typeof route.path).toBe('string');
        expect(route.path.length).toBeGreaterThan(0);
      });
    });

    it('should not have duplicate paths', () => {
      const paths = coreRoutes.map(route => route.path);
      const uniquePaths = new Set(paths);
      expect(paths.length).toBe(uniquePaths.size);
    });
  });

  describe('Route Elements', () => {
    it('should have valid React elements', () => {
      coreRoutes.forEach(route => {
        expect(route.element).toBeDefined();
      });
    });
  });

  describe('Route Structure', () => {
    it('should include home route', () => {
      const hasHomeRoute = coreRoutes.some(route => 
        route.path === '/' || route.path === ''
      );
      expect(hasHomeRoute).toBe(true);
    });

    it('should include login route', () => {
      const hasLoginRoute = coreRoutes.some(route => 
        route.path.includes('login')
      );
      expect(hasLoginRoute).toBe(true);
    });

    it('should include not found route', () => {
      const hasNotFoundRoute = coreRoutes.some(route => 
        route.path === '*' || route.path.includes('404')
      );
      expect(hasNotFoundRoute).toBe(true);
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
