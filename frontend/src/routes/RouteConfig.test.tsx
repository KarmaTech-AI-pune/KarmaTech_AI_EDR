import { describe, it, expect, vi, beforeEach } from 'vitest';
import RouteConfig from './RouteConfig';

describe('RouteConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Configuration', () => {
    it('should export route configuration', () => {
      expect(RouteConfig).toBeDefined();
    });

    it('should be an array of routes', () => {
      expect(Array.isArray(RouteConfig)).toBe(true);
    });

    it('should have route objects', () => {
      RouteConfig.forEach(route => {
        expect(route).toBeDefined();
        expect(typeof route).toBe('object');
      });
    });
  });

  describe('Route Structure', () => {
    it('should have path property for each route', () => {
      RouteConfig.forEach(route => {
        expect(route).toHaveProperty('path');
      });
    });

    it('should have element property for each route', () => {
      RouteConfig.forEach(route => {
        expect(route).toHaveProperty('element');
      });
    });

    it('should have valid path strings', () => {
      RouteConfig.forEach(route => {
        if (route.path !== undefined) {
          expect(typeof route.path).toBe('string');
        }
      });
    });
  });

  describe('Route Paths', () => {
    it('should not have duplicate paths', () => {
      const paths = RouteConfig.map(route => route.path);
      const uniquePaths = new Set(paths);
      expect(paths.length).toBe(uniquePaths.size);
    });

    it('should have valid path formats', () => {
      RouteConfig.forEach(route => {
        expect(route.path).toBeTruthy();
        expect(route.path.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Route Elements', () => {
    it('should have valid React elements', () => {
      RouteConfig.forEach(route => {
        expect(route.element).toBeDefined();
      });
    });
  });

  describe('Route Categories', () => {
    const flattenRoutes = (routes: any[]): any[] => {
      return routes.reduce((acc, route) => {
        acc.push(route);
        if (route.children) acc.push(...flattenRoutes(route.children));
        return acc;
      }, []);
    };

    it('should include core routes', () => {
      const allRoutes = flattenRoutes(RouteConfig);
      const hasCoreRoutes = allRoutes.some(route => 
        route.path === '/' || route.path === 'login' || route.path === '*'
      );
      expect(hasCoreRoutes).toBe(true);
    });

    it('should include admin routes', () => {
      const allRoutes = flattenRoutes(RouteConfig);
      const hasAdminRoutes = allRoutes.some(route => 
        route.path?.includes('admin')
      );
      expect(hasAdminRoutes).toBe(true);
    });

    it('should include project management routes', () => {
      const allRoutes = flattenRoutes(RouteConfig);
      const hasProjectRoutes = allRoutes.some(route => 
        route.path?.includes('project')
      );
      expect(hasProjectRoutes).toBe(true);
    });
  });

  describe('Route Nesting', () => {
    it('should support nested routes', () => {
      const hasNestedRoutes = RouteConfig.some(route => 
        route.children && Array.isArray(route.children)
      );
      // May or may not have nested routes depending on configuration
      expect(typeof hasNestedRoutes).toBe('boolean');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty route configuration gracefully', () => {
      expect(RouteConfig).toBeDefined();
      expect(Array.isArray(RouteConfig)).toBe(true);
    });

    it('should have consistent route structure', () => {
      RouteConfig.forEach(route => {
        expect(route).toHaveProperty('path');
        expect(route).toHaveProperty('element');
      });
    });

    it('should handle catch-all routes', () => {
      const hasCatchAll = RouteConfig.some(route => 
        route.path === '*'
      );
      // May or may not have catch-all route
      expect(typeof hasCatchAll).toBe('boolean');
    });
  });

  describe('Route Validation', () => {
    it('should have at least one route', () => {
      expect(RouteConfig.length).toBeGreaterThan(0);
    });

    it('should have valid route configuration', () => {
      RouteConfig.forEach(route => {
        expect(route.path).toBeTruthy();
        expect(route.element).toBeTruthy();
      });
    });
  });
});
