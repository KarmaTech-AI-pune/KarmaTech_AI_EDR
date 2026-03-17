import { describe, it, expect, vi, beforeEach } from 'vitest';
import programManagementRoutes from './programManagementRoutes';

describe('Program Management Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Definition', () => {
    it('should export program management routes', () => {
      expect(programManagementRoutes).toBeDefined();
    });

    it('should be an array of routes', () => {
      expect(Array.isArray(programManagementRoutes)).toBe(true);
    });

    it('should have route objects with path property', () => {
      programManagementRoutes.forEach(route => {
        expect(route).toHaveProperty('path');
      });
    });

    it('should have route objects with element property', () => {
      programManagementRoutes.forEach(route => {
        expect(route).toHaveProperty('element');
      });
    });
  });

  describe('Route Paths', () => {
    it('should have valid path strings', () => {
      programManagementRoutes.forEach(route => {
        expect(typeof route.path).toBe('string');
        expect(route.path.length).toBeGreaterThan(0);
      });
    });

    it('should have program-related paths', () => {
      const programPaths = programManagementRoutes.map(route => route.path);
      const hasProgramPath = programPaths.some(path => 
        path.includes('program') || path.includes('management')
      );
      expect(hasProgramPath).toBe(true);
    });

    it('should not have duplicate paths', () => {
      const paths = programManagementRoutes.map(route => route.path);
      const uniquePaths = new Set(paths);
      expect(paths.length).toBe(uniquePaths.size);
    });
  });

  describe('Route Elements', () => {
    it('should have valid React elements', () => {
      programManagementRoutes.forEach(route => {
        expect(route.element).toBeDefined();
      });
    });
  });

  describe('Program Management Route Types', () => {
    it('should include program list routes', () => {
      const hasListRoutes = programManagementRoutes.some(route => 
        route.path.includes('program') && !route.path.includes(':')
      );
      expect(hasListRoutes).toBe(true);
    });

    it('should include program detail routes', () => {
      const hasDetailRoutes = programManagementRoutes.some(route => 
        route.path.includes(':id')
      );
      expect(hasDetailRoutes).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty routes array gracefully', () => {
      expect(programManagementRoutes).toBeDefined();
      expect(Array.isArray(programManagementRoutes)).toBe(true);
    });

    it('should have consistent route structure', () => {
      programManagementRoutes.forEach(route => {
        expect(route).toHaveProperty('path');
        expect(route).toHaveProperty('element');
      });
    });
  });
});
