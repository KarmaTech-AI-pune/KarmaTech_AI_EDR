import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getVersionInfo, getDisplayVersion, getVersionForErrorReporting, isDevelopmentBuild } from '../version';

// Mock the global variables that would be injected by Vite
const mockGlobals = {
  __APP_VERSION__: '1.12.0',
  __BUILD_DATE__: '2024-12-04T10:30:00.000Z'
};

describe('Version utilities', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock the global variables
    Object.defineProperty(globalThis, '__APP_VERSION__', {
      value: mockGlobals.__APP_VERSION__,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(globalThis, '__BUILD_DATE__', {
      value: mockGlobals.__BUILD_DATE__,
      writable: true,
      configurable: true
    });
  });

  describe('getVersionInfo', () => {
    it('should return version info from build-time injected values', () => {
      const versionInfo = getVersionInfo();
      
      expect(versionInfo.version).toBe('1.12.0');
      expect(versionInfo.buildDate).toBe('2024-12-04T10:30:00.000Z');
      expect(versionInfo.displayVersion).toBe('v1.12.0');
    });

    it('should handle missing global variables gracefully', () => {
      // Remove global variables
      delete (globalThis as any).__APP_VERSION__;
      delete (globalThis as any).__BUILD_DATE__;
      
      const versionInfo = getVersionInfo();
      
      expect(versionInfo.version).toBe('dev');
      expect(versionInfo.displayVersion).toBe('vdev');
      expect(versionInfo.buildDate).toBeDefined();
    });
  });

  describe('getDisplayVersion', () => {
    it('should return formatted version string', () => {
      const displayVersion = getDisplayVersion();
      expect(displayVersion).toBe('v1.12.0');
    });
  });

  describe('getVersionForErrorReporting', () => {
    it('should return version with build date for error reporting', () => {
      const errorVersion = getVersionForErrorReporting();
      expect(errorVersion).toBe('v1.12.0 (2024-12-04)');
    });
  });

  describe('isDevelopmentBuild', () => {
    it('should return false for production version', () => {
      const isDev = isDevelopmentBuild();
      expect(isDev).toBe(false);
    });

    it('should return true for development version', () => {
      // Mock development version
      Object.defineProperty(globalThis, '__APP_VERSION__', {
        value: 'dev',
        writable: true,
        configurable: true
      });
      
      const isDev = isDevelopmentBuild();
      expect(isDev).toBe(true);
    });

    it('should return true for unknown version', () => {
      // Mock unknown version
      Object.defineProperty(globalThis, '__APP_VERSION__', {
        value: 'unknown',
        writable: true,
        configurable: true
      });
      
      const isDev = isDevelopmentBuild();
      expect(isDev).toBe(true);
    });
  });
});