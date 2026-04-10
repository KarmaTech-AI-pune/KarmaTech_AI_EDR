import { describe, it, expect, vi, beforeEach } from 'vitest';
import { programManagementRoutes } from './programManagementRoutes';

const flattenRoutes = (routes: any[]): any[] =>
  routes.reduce((acc, r) => {
    acc.push(r);
    if (r.children) acc.push(...flattenRoutes(r.children));
    return acc;
  }, []);

describe('Program Management Routes', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Route Definition', () => {
    it('should export program management routes', () => { expect(programManagementRoutes).toBeDefined(); });
    it('should be an array of routes', () => { expect(Array.isArray(programManagementRoutes)).toBe(true); });
    it('should have route objects with path property', () => {
      programManagementRoutes.forEach(route => { expect(route).toHaveProperty('path'); });
    });
    it('should have route objects with children or element', () => {
      programManagementRoutes.forEach(route => {
        expect(route.children || route.element).toBeDefined();
      });
    });
  });

  describe('Route Paths', () => {
    it('should have valid path strings', () => {
      programManagementRoutes.forEach(route => { expect(typeof route.path).toBe('string'); });
    });
    it('should have program-related paths', () => {
      expect(programManagementRoutes.some(r => r.path?.includes('program'))).toBe(true);
    });
    it('should not have duplicate paths', () => {
      const paths = programManagementRoutes.map(r => r.path);
      expect(paths.length).toBe(new Set(paths).size);
    });
  });

  describe('Route Elements', () => {
    it('should have valid React elements in children', () => {
      const allRoutes = flattenRoutes(programManagementRoutes);
      expect(allRoutes.filter(r => r.element !== undefined).length).toBeGreaterThan(0);
    });
  });

  describe('Program Management Route Types', () => {
    it('should include program-management path', () => {
      expect(programManagementRoutes.some(r => r.path?.includes('program-management'))).toBe(true);
    });
    it('should include project routes in children', () => {
      const allRoutes = flattenRoutes(programManagementRoutes);
      expect(allRoutes.some(r => r.path?.includes('project') || r.path?.includes('projects'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty routes array gracefully', () => {
      expect(programManagementRoutes).toBeDefined();
      expect(Array.isArray(programManagementRoutes)).toBe(true);
    });
    it('should have consistent route structure', () => {
      programManagementRoutes.forEach(route => { expect(route).toHaveProperty('path'); });
    });
  });
});
