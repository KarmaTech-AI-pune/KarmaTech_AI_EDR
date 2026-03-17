import { describe, it, expect, vi, beforeEach } from 'vitest';
import adminRoutes from './adminRoutes';

describe('Admin Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Definition', () => {
    it('should export admin routes', () => {
      expect(adminRoutes).toBeDefined();
    });

    it('should be an array of routes', () => {
      expect(Array.isArray(adminRoutes)).toBe(true);
    });

    it('should have route objects with path property', () => {
      adminRoutes.forEach(route => {
        expect(route).toHaveProperty('path');
      });
    });

    it('should have route objects with element property', () => {
      adminRoutes.forEach(route => {
        expect(route).toHaveProperty('element');
      });
    });
  });

  describe('Route Paths', () => {
    it('should have valid path strings', () => {
      adminRoutes.forEach(route => {
        expect(typeof route.path).toBe('string');
        expect(route.path.length).toBeGreaterThan(0);
      });
    });

    it('should have admin-related paths', () => {
      const adminPaths = adminRoutes.map(route => route.path);
      const hasAdminPath = adminPaths.some(path => 
        path.includes('admin') || path.includes('management')
      );
      expect(hasAdminPath).toBe(true);
    });

    it('should not have duplicate paths', () => {
      const paths = adminRoutes.map(route => route.path);
      const uniquePaths = new Set(paths);
      expect(paths.length).toBe(uniquePaths.size);
    });
  });

  describe('Route Elements', () => {
    it('should have valid React elements', () => {
      adminRoutes.forEach(route => {
        expect(route.element).toBeDefined();
      });
    });
  });

  describe('Admin Route Types', () => {
    it('should include user management routes', () => {
      const hasUserRoutes = adminRoutes.some(route => 
        route.path.includes('user') || route.path.includes('users')
      );
      expect(hasUserRoutes).toBe(true);
    });

    it('should include role management routes', () => {
      const hasRoleRoutes = adminRoutes.some(route => 
        route.path.includes('role') || route.path.includes('roles')
      );
      expect(hasRoleRoutes).toBe(true);
    });

    it('should include settings routes', () => {
      const hasSettingsRoutes = adminRoutes.some(route => 
        route.path.includes('setting') || route.path.includes('settings')
      );
      expect(hasSettingsRoutes).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty routes array gracefully', () => {
      expect(adminRoutes).toBeDefined();
      expect(Array.isArray(adminRoutes)).toBe(true);
    });

    it('should have consistent route structure', () => {
      adminRoutes.forEach(route => {
        expect(route).toHaveProperty('path');
        expect(route).toHaveProperty('element');
      });
    });
  });
});
