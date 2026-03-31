import { describe, it, expect } from 'vitest';
import * as pageExports from './index';

describe('Pages Index', () => {
  describe('Exports', () => {
    it('should export all page components', () => {
      expect(pageExports).toBeDefined();
    });

    it('should have Home export', () => {
      expect(pageExports.Home).toBeDefined();
    });

    it('should have AdminPanel export', () => {
      expect(pageExports.AdminPanel).toBeDefined();
    });

    it('should have ProjectManagement export', () => {
      expect(pageExports.ProjectManagement).toBeDefined();
    });

    it('should have BusinessDevelopment export', () => {
      expect(pageExports.BusinessDevelopment).toBeDefined();
    });

    it('should have BusinessDevelopmentDetails export', () => {
      expect(pageExports.BusinessDevelopmentDetails).toBeDefined();
    });

    it('should have LoginScreen export', () => {
      expect(pageExports.LoginScreen).toBeDefined();
    });

    it('should have ProjectDetails export', () => {
      expect(pageExports.ProjectDetails).toBeDefined();
    });
  });

  describe('Export Types', () => {
    it('should export components as functions', () => {
      expect(typeof pageExports.Home).toBe('function');
      expect(typeof pageExports.AdminPanel).toBe('function');
      expect(typeof pageExports.ProjectManagement).toBe('function');
    });

    it('should export valid React components', () => {
      expect(pageExports.Home).toBeDefined();
      expect(pageExports.AdminPanel).toBeDefined();
    });
  });
});
 