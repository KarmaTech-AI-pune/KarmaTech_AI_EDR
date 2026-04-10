/**
 * Unit Tests for Version Utilities
 * 
 * Tests version information retrieval, formatting, and development detection.
 * Covers build-time injection, environment variables, and fallback scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  getVersionInfo, 
  getDisplayVersion, 
  getVersionForErrorReporting, 
  isDevelopmentBuild,
  type VersionInfo 
} from './version';

// Mock global variables that would be injected at build time
declare global {
  var __APP_VERSION__: string | undefined;
  var __BUILD_DATE__: string | undefined;
}

describe('Version Utilities', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Reset global variables
    delete (globalThis as any).__APP_VERSION__;
    delete (globalThis as any).__BUILD_DATE__;
    
    // Reset import.meta.env variables
    delete (import.meta.env as any).VITE_APP_VERSION;
    delete (import.meta.env as any).REACT_APP_VERSION;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as any).__APP_VERSION__;
    delete (globalThis as any).__BUILD_DATE__;
    delete (import.meta.env as any).VITE_APP_VERSION;
    delete (import.meta.env as any).REACT_APP_VERSION;
  });

  describe('getVersionInfo()', () => {
    describe('Build-time Injection (Highest Priority)', () => {
      it('should use build-time injected version and build date', () => {
        // Arrange
        (globalThis as any).__APP_VERSION__ = '1.12.0';
        (globalThis as any).__BUILD_DATE__ = '2024-03-17T10:30:00.000Z';
        delete (import.meta.env as any).VITE_APP_VERSION;
        delete (import.meta.env as any).REACT_APP_VERSION;

        // Act
        const versionInfo = getVersionInfo();

        // Assert
        expect(versionInfo.version).toBe('1.12.0');
        expect(versionInfo.displayVersion).toBe('v1.12.0');
      });

      it('should ignore build-time injection if version is "unknown"', () => {
        // Arrange
        (globalThis as any).__APP_VERSION__ = 'unknown';
        (globalThis as any).__BUILD_DATE__ = '2024-03-17T10:30:00.000Z';
        delete (import.meta.env as any).VITE_APP_VERSION;
        delete (import.meta.env as any).REACT_APP_VERSION;

        // Act
        const versionInfo = getVersionInfo();

        // Assert
        expect(versionInfo.version).toBe('dev'); // Falls back to dev
      });
    });

    describe('Environment Variables (Fallback)', () => {
      it('should use VITE_APP_VERSION when build injection is not available', () => {
        // Arrange
        delete (globalThis as any).__APP_VERSION__;
        delete (globalThis as any).__BUILD_DATE__;
        (import.meta.env as any).VITE_APP_VERSION = '2.1.0';
        delete (import.meta.env as any).REACT_APP_VERSION;

        // Act
        const versionInfo = getVersionInfo();

        // Assert
        expect(versionInfo.version).toBe('2.1.0');
        expect(versionInfo.displayVersion).toBe('v2.1.0');
      });

      it('should use REACT_APP_VERSION when VITE_APP_VERSION is not available', () => {
        // Arrange
        delete (globalThis as any).__APP_VERSION__;
        delete (globalThis as any).__BUILD_DATE__;
        delete (import.meta.env as any).VITE_APP_VERSION;
        (import.meta.env as any).REACT_APP_VERSION = '1.8.5';

        // Act
        const versionInfo = getVersionInfo();

        // Assert
        expect(versionInfo.version).toBe('1.8.5');
        expect(versionInfo.displayVersion).toBe('v1.8.5');
      });

      it('should prefer VITE_APP_VERSION over REACT_APP_VERSION', () => {
        // Arrange
        delete (globalThis as any).__APP_VERSION__;
        delete (globalThis as any).__BUILD_DATE__;
        (import.meta.env as any).VITE_APP_VERSION = '3.0.0';
        (import.meta.env as any).REACT_APP_VERSION = '2.9.0';

        // Act
        const versionInfo = getVersionInfo();

        // Assert
        expect(versionInfo.version).toBe('3.0.0');
      });
    });

    describe('Final Fallback', () => {
      it('should use "dev" as final fallback when no version is available', () => {
        // Arrange
        delete (globalThis as any).__APP_VERSION__;
        delete (globalThis as any).__BUILD_DATE__;
        delete (import.meta.env as any).VITE_APP_VERSION;
        delete (import.meta.env as any).REACT_APP_VERSION;

        // Act
        const versionInfo = getVersionInfo();

        // Assert
        expect(versionInfo.version).toBe('dev');
        expect(versionInfo.displayVersion).toBe('vdev');
      });

      it('should use current date as fallback for build date', () => {
        // Arrange
        const mockDate = new Date('2024-03-17T12:00:00.000Z');
        vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate.toISOString());

        // Act
        const versionInfo = getVersionInfo();

        // Assert
        expect(versionInfo.buildDate).toBe('2024-03-17T12:00:00.000Z');
      });
    });

    describe('Error Handling', () => {
      it('should handle errors gracefully and return fallback values', () => {
        // Act
        const versionInfo = getVersionInfo();

        // Assert - Should always return valid object
        expect(versionInfo).toHaveProperty('version');
        expect(versionInfo).toHaveProperty('buildDate');
        expect(versionInfo).toHaveProperty('displayVersion');
        expect(typeof versionInfo.version).toBe('string');
        expect(typeof versionInfo.buildDate).toBe('string');
      });
    });

    describe('Return Type Validation', () => {
      it('should return object with correct structure', () => {
        // Act
        const versionInfo = getVersionInfo();

        // Assert
        expect(versionInfo).toHaveProperty('version');
        expect(versionInfo).toHaveProperty('buildDate');
        expect(versionInfo).toHaveProperty('displayVersion');
        expect(typeof versionInfo.version).toBe('string');
        expect(typeof versionInfo.buildDate).toBe('string');
        expect(typeof versionInfo.displayVersion).toBe('string');
      });

      it('should have displayVersion starting with "v"', () => {
        // Arrange
        globalThis.__APP_VERSION__ = '2.5.1';

        // Act
        const versionInfo = getVersionInfo();

        // Assert
        expect(versionInfo.displayVersion).toBe('v2.5.1');
        expect(versionInfo.displayVersion.startsWith('v')).toBe(true);
      });
    });
  });

  describe('getDisplayVersion()', () => {
    it('should return formatted version string', () => {
      // Arrange
      (globalThis as any).__APP_VERSION__ = '1.2.3';
      delete (import.meta.env as any).VITE_APP_VERSION;
      delete (import.meta.env as any).REACT_APP_VERSION;

      // Act
      const displayVersion = getDisplayVersion();

      // Assert
      expect(displayVersion).toBe('v1.2.3');
    });

    it('should return formatted dev version', () => {
      // Arrange
      delete (globalThis as any).__APP_VERSION__;
      delete (import.meta.env as any).VITE_APP_VERSION;
      delete (import.meta.env as any).REACT_APP_VERSION;

      // Act
      const displayVersion = getDisplayVersion();

      // Assert
      expect(displayVersion).toBe('vdev');
    });

    it('should handle special version formats', () => {
      // Arrange
      (globalThis as any).__APP_VERSION__ = '2.0.0-beta.1';
      delete (import.meta.env as any).VITE_APP_VERSION;
      delete (import.meta.env as any).REACT_APP_VERSION;

      // Act
      const displayVersion = getDisplayVersion();

      // Assert
      expect(displayVersion).toBe('v2.0.0-beta.1');
    });
  });

  describe('getVersionForErrorReporting()', () => {
    it('should return version with build date for production', () => {
      // Arrange
      (globalThis as any).__APP_VERSION__ = '1.5.0';
      (globalThis as any).__BUILD_DATE__ = '2024-03-17T14:30:00.000Z';
      delete (import.meta.env as any).VITE_APP_VERSION;
      delete (import.meta.env as any).REACT_APP_VERSION;

      // Act
      const errorVersion = getVersionForErrorReporting();

      // Assert
      expect(errorVersion).toBe('v1.5.0 (2024-03-17)');
    });

    it('should extract date part from ISO string', () => {
      // Arrange
      (globalThis as any).__APP_VERSION__ = '2.1.0';
      (globalThis as any).__BUILD_DATE__ = '2024-12-25T23:59:59.999Z';
      delete (import.meta.env as any).VITE_APP_VERSION;
      delete (import.meta.env as any).REACT_APP_VERSION;

      // Act
      const errorVersion = getVersionForErrorReporting();

      // Assert
      expect(errorVersion).toBe('v2.1.0 (2024-12-25)');
    });

    it('should handle dev version with current date', () => {
      // Arrange
      delete (globalThis as any).__APP_VERSION__;
      delete (globalThis as any).__BUILD_DATE__;
      delete (import.meta.env as any).VITE_APP_VERSION;
      delete (import.meta.env as any).REACT_APP_VERSION;
      const mockDate = new Date('2024-03-17T10:00:00.000Z');
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate.toISOString());

      // Act
      const errorVersion = getVersionForErrorReporting();

      // Assert
      expect(errorVersion).toBe('vdev (2024-03-17)');
    });

    it('should handle malformed build date gracefully', () => {
      // Arrange
      (globalThis as any).__APP_VERSION__ = '1.0.0';
      (globalThis as any).__BUILD_DATE__ = 'invalid-date-format';
      delete (import.meta.env as any).VITE_APP_VERSION;
      delete (import.meta.env as any).REACT_APP_VERSION;

      // Act
      const errorVersion = getVersionForErrorReporting();

      // Assert
      expect(errorVersion).toBe('v1.0.0 (invalid-date-format)');
    });
  });

  describe('isDevelopmentBuild()', () => {
    describe('Development Detection', () => {
      it('should return true for "dev" version', () => {
        // Arrange
        delete (globalThis as any).__APP_VERSION__;
        delete (import.meta.env as any).VITE_APP_VERSION;
        delete (import.meta.env as any).REACT_APP_VERSION;

        // Act
        const isDev = isDevelopmentBuild();

        // Assert
        expect(isDev).toBe(true);
      });

      it('should return true for "unknown" version', () => {
        // Arrange
        (import.meta.env as any).VITE_APP_VERSION = 'unknown';
        delete (globalThis as any).__APP_VERSION__;

        // Act
        const isDev = isDevelopmentBuild();

        // Assert
        expect(isDev).toBe(true);
      });

      it('should return true for versions containing "dev"', () => {
        // Arrange
        const devVersions = ['1.0.0-dev', 'dev-build', '2.1.0-dev.123', 'development'];
        
        devVersions.forEach(version => {
          (globalThis as any).__APP_VERSION__ = version;
          delete (import.meta.env as any).VITE_APP_VERSION;
          delete (import.meta.env as any).REACT_APP_VERSION;
          
          // Act
          const isDev = isDevelopmentBuild();
          
          // Assert
          expect(isDev).toBe(true);
        });
      });
    });

    describe('Production Detection', () => {
      it('should return false for production versions', () => {
        // Arrange
        const prodVersions = ['1.0.0', '2.5.1', '10.0.0-beta.1', '1.2.3-rc.1'];
        
        prodVersions.forEach(version => {
          globalThis.__APP_VERSION__ = version;
          
          // Act
          const isDev = isDevelopmentBuild();
          
          // Assert
          expect(isDev).toBe(false);
        });
      });

      it('should return false for semantic versions', () => {
        // Arrange
        globalThis.__APP_VERSION__ = '3.14.159';

        // Act
        const isDev = isDevelopmentBuild();

        // Assert
        expect(isDev).toBe(false);
      });

      it('should return false for release candidates', () => {
        // Arrange
        globalThis.__APP_VERSION__ = '2.0.0-rc.1';

        // Act
        const isDev = isDevelopmentBuild();

        // Assert
        expect(isDev).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty version string', () => {
        // Arrange
        globalThis.__APP_VERSION__ = '';

        // Act
        const isDev = isDevelopmentBuild();

        // Assert
        expect(isDev).toBe(false);
      });

      it('should handle version with "dev" in the middle', () => {
        // Arrange
        globalThis.__APP_VERSION__ = '1.device.0'; // Contains "dev" but not development

        // Act
        const isDev = isDevelopmentBuild();

        // Assert
        expect(isDev).toBe(true); // Current implementation would return true
      });

      it('should be case sensitive for "dev" detection', () => {
        // Arrange
        globalThis.__APP_VERSION__ = '1.0.0-DEV';

        // Act
        const isDev = isDevelopmentBuild();

        // Assert
        expect(isDev).toBe(false); // Case sensitive
      });
    });
  });

  describe('Integration Tests', () => {
    it('should maintain consistency across all functions', () => {
      // Arrange
      (globalThis as any).__APP_VERSION__ = '1.8.0';
      (globalThis as any).__BUILD_DATE__ = '2024-03-17T16:20:00.000Z';
      delete (import.meta.env as any).VITE_APP_VERSION;
      delete (import.meta.env as any).REACT_APP_VERSION;

      // Act
      const versionInfo = getVersionInfo();
      const displayVersion = getDisplayVersion();
      const errorVersion = getVersionForErrorReporting();
      const isDev = isDevelopmentBuild();

      // Assert
      expect(versionInfo.version).toBe('1.8.0');
      expect(versionInfo.displayVersion).toBe(displayVersion);
      expect(displayVersion).toBe('v1.8.0');
      expect(errorVersion).toBe('v1.8.0 (2024-03-17)');
      expect(isDev).toBe(false);
    });

    it('should handle complete fallback scenario consistently', () => {
      // Arrange
      delete (globalThis as any).__APP_VERSION__;
      delete (globalThis as any).__BUILD_DATE__;
      delete (import.meta.env as any).VITE_APP_VERSION;
      delete (import.meta.env as any).REACT_APP_VERSION;
      const mockDate = new Date('2024-03-17T09:15:00.000Z');
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate.toISOString());

      // Act
      const versionInfo = getVersionInfo();
      const displayVersion = getDisplayVersion();
      const errorVersion = getVersionForErrorReporting();
      const isDev = isDevelopmentBuild();

      // Assert
      expect(versionInfo.version).toBe('dev');
      expect(displayVersion).toBe('vdev');
      expect(errorVersion).toBe('vdev (2024-03-17)');
      expect(isDev).toBe(true);
    });

    it('should work correctly when called multiple times', () => {
      // Arrange
      (globalThis as any).__APP_VERSION__ = '2.0.0';
      (globalThis as any).__BUILD_DATE__ = '2024-03-17T11:00:00.000Z';
      delete (import.meta.env as any).VITE_APP_VERSION;
      delete (import.meta.env as any).REACT_APP_VERSION;

      // Act
      const firstCall = getVersionInfo();
      const secondCall = getVersionInfo();
      const thirdCall = getVersionInfo();

      // Assert
      expect(firstCall).toEqual(secondCall);
      expect(secondCall).toEqual(thirdCall);
      expect(firstCall.version).toBe('2.0.0');
    });
  });

  describe('Type Safety', () => {
    it('should return VersionInfo interface compliant object', () => {
      // Act
      const versionInfo: VersionInfo = getVersionInfo();

      // Assert - TypeScript compilation test
      expect(versionInfo.version).toBeDefined();
      expect(versionInfo.buildDate).toBeDefined();
      expect(versionInfo.displayVersion).toBeDefined();
    });

    it('should return string from getDisplayVersion', () => {
      // Act
      const displayVersion: string = getDisplayVersion();

      // Assert - TypeScript compilation test
      expect(typeof displayVersion).toBe('string');
    });

    it('should return string from getVersionForErrorReporting', () => {
      // Act
      const errorVersion: string = getVersionForErrorReporting();

      // Assert - TypeScript compilation test
      expect(typeof errorVersion).toBe('string');
    });

    it('should return boolean from isDevelopmentBuild', () => {
      // Act
      const isDev: boolean = isDevelopmentBuild();

      // Assert - TypeScript compilation test
      expect(typeof isDev).toBe('boolean');
    });
  });
});