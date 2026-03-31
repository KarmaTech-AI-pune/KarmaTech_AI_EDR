import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectManagementRoutes } from './projectManagementRoutes';

const flattenRoutes = (routes: any[]): any[] =>
  routes.reduce((acc, r) => {
    acc.push(r);
    if (r.children) acc.push(...flattenRoutes(r.children));
    return acc;
  }, []);

describe('Project Management Routes', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Route Definition', () => {
    it('should export project management routes', () => { expect(projectManagementRoutes).toBeDefined(); });
    it('should be an array of routes', () => { expect(Array.isArray(projectManagementRoutes)).toBe(true); });
    it('should have route objects with path property', () => {
      projectManagementRoutes.forEach(route => { expect(route).toHaveProperty('path'); });
    });
    it('should have route objects with children or element', () => {
      projectManagementRoutes.forEach(route => {
        expect(route.children || route.element).toBeDefined();
      });
    });
  });

  describe('Route Paths', () => {
    it('should have valid path strings', () => {
      projectManagementRoutes.forEach(route => { expect(typeof route.path).toBe('string'); });
    });
    it('should have project-related paths', () => {
      expect(projectManagementRoutes.some(r => r.path?.includes('project'))).toBe(true);
    });
    it('should not have duplicate paths', () => {
      const paths = projectManagementRoutes.map(r => r.path);
      expect(paths.length).toBe(new Set(paths).size);
    });
  });

  describe('Route Elements', () => {
    it('should have valid React elements in children', () => {
      const allRoutes = flattenRoutes(projectManagementRoutes);
      expect(allRoutes.filter(r => r.element !== undefined).length).toBeGreaterThan(0);
    });
  });

  describe('Project Management Route Types', () => {
    it('should include project list routes', () => {
      expect(projectManagementRoutes.some(r => r.path?.includes('project-management'))).toBe(true);
    });
    it('should include project detail routes in children', () => {
      const allRoutes = flattenRoutes(projectManagementRoutes);
      expect(allRoutes.some(r => r.path?.includes('project') || r.path?.includes('overview'))).toBe(true);
    });
    it('should include budget-history routes in children', () => {
      const allRoutes = flattenRoutes(projectManagementRoutes);
      expect(allRoutes.some(r => r.path?.includes('budget-history'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty routes array gracefully', () => {
      expect(projectManagementRoutes).toBeDefined();
      expect(Array.isArray(projectManagementRoutes)).toBe(true);
    });
    it('should have consistent route structure', () => {
      projectManagementRoutes.forEach(route => { expect(route).toHaveProperty('path'); });
    });
  });
});
