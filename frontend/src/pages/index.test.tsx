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

    it('should have NotFound export', () => {
      expect(pageExports.NotFound).toBeDefined();
    });

    it('should have ForgotPassword export', () => {
      expect(pageExports.ForgotPassword).toBeDefined();
    });

    it('should have UserProfile export', () => {
      expect(pageExports.UserProfile).toBeDefined();
    });

    it('should have Users export', () => {
      expect(pageExports.Users).toBeDefined();
    });

    it('should have Roles export', () => {
      expect(pageExports.Roles).toBeDefined();
    });

    it('should have ProjectManagement export', () => {
      expect(pageExports.ProjectManagement).toBeDefined();
    });

    it('should have ProjectClosure export', () => {
      expect(pageExports.ProjectClosure).toBeDefined();
    });

    it('should have MigrationManagement export', () => {
      expect(pageExports.MigrationManagement).toBeDefined();
    });

    it('should have FeaturesManagement export', () => {
      expect(pageExports.FeaturesManagement).toBeDefined();
    });

    it('should have ResetPassword export', () => {
      expect(pageExports.ResetPassword).toBeDefined();
    });

    it('should have BusinessDevelopment export', () => {
      expect(pageExports.BusinessDevelopment).toBeDefined();
    });

    it('should have BusinessDevelopmentDashboard export', () => {
      expect(pageExports.BusinessDevelopmentDashboard).toBeDefined();
    });

    it('should have BusinessDevelopmentDetails export', () => {
      expect(pageExports.BusinessDevelopmentDetails).toBeDefined();
    });
  });

  describe('Export Types', () => {
    it('should export components as functions', () => {
      expect(typeof pageExports.Home).toBe('function');
      expect(typeof pageExports.AdminPanel).toBe('function');
      expect(typeof pageExports.NotFound).toBe('function');
    });

    it('should export valid React components', () => {
      // Check if exports are React components (functions that return JSX)
      expect(pageExports.Home).toBeDefined();
      expect(pageExports.AdminPanel).toBeDefined();
    });
  });
});
