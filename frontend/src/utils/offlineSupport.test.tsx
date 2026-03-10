import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  OfflineManager,
  useOfflineState,
  formatOfflineDuration,
  createOfflineMessage,
  OfflineState
} from './offlineSupport';

describe('offlineSupport utils', () => {
  let originalOnLine: boolean;

  beforeAll(() => {
    originalOnLine = navigator.onLine;
  });

  afterAll(() => {
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      configurable: true,
    });
  });

  beforeEach(() => {
    // Reset singleton instance for clean tests
    // @ts-ignore
    OfflineManager.instance = undefined;

    // Mock localStorage
    const localStorageMock = (function () {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      };
    })();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
    });

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
      } as Response)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatOfflineDuration', () => {
    it('returns "Just now" for less than 1 minute', () => {
      expect(formatOfflineDuration(30000)).toBe('Just now');
    });

    it('returns minutes for less than 1 hour', () => {
      expect(formatOfflineDuration(60000)).toBe('1 minute ago');
      expect(formatOfflineDuration(120000)).toBe('2 minutes ago');
    });

    it('returns hours for less than 1 day', () => {
      expect(formatOfflineDuration(3600000)).toBe('1 hour ago');
      expect(formatOfflineDuration(7200000)).toBe('2 hours ago');
    });

    it('returns days for 1 day or more', () => {
      expect(formatOfflineDuration(86400000)).toBe('1 day ago');
      expect(formatOfflineDuration(172800000)).toBe('2 days ago');
    });
  });

  describe('createOfflineMessage', () => {
    it('returns "Online" when not offline', () => {
      const state: OfflineState = { isOffline: false, lastOnlineTime: Date.now(), offlineDuration: 0 };
      expect(createOfflineMessage(state)).toBe('Online');
    });

    it('returns formatted offline message when offline', () => {
      const state: OfflineState = { isOffline: true, lastOnlineTime: Date.now() - 60000, offlineDuration: 60000 };
      expect(createOfflineMessage(state)).toBe('Offline since 1 minute ago');
    });
  });

  describe('OfflineManager', () => {
    it('initializes correctly', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      const manager = OfflineManager.getInstance();
      expect(manager.isOffline()).toBe(false);
    });

    it('detects offline state on initialization if navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      const manager = OfflineManager.getInstance();
      expect(manager.isOffline()).toBe(true);
    });

    it('allows caching and retrieving version info', () => {
      const manager = OfflineManager.getInstance();
      const versionInfo = { version: '1.0.0', displayVersion: '1.0.0', fullVersion: '1.0.0', buildDate: '2023', commitHash: 'abc', environment: 'test' };
      
      manager.cacheVersionInfo(versionInfo);
      const cached = manager.getCachedVersionInfo();
      
      expect(cached).toEqual(versionInfo);
      expect(localStorage.setItem).toHaveBeenCalledWith('offline_version_cache', JSON.stringify(versionInfo));
    });

    it('allows caching and retrieving release notes', () => {
      const manager = OfflineManager.getInstance();
      const releaseNotes = { 
        version: '1.0.0', 
        features: [], 
        bugFixes: [], 
        improvements: [],
        date: '2023-01-01'
      };
      
      // @ts-ignore
      manager.cacheReleaseNotes('1.0.0', releaseNotes);
      const cached = manager.getCachedReleaseNotes('1.0.0');
      
      expect(cached).toEqual(releaseNotes);
      
      const versions = manager.getCachedVersions();
      expect(versions).toContain('1.0.0');
    });

    it('can clear cache', () => {
      const manager = OfflineManager.getInstance();
      manager.clearOfflineCache();
      expect(localStorage.removeItem).toHaveBeenCalledWith('offline_version_cache');
      expect(localStorage.removeItem).toHaveBeenCalledWith('offline_release_notes_cache');
    });
    
    it('gets cache stats', () => {
      const manager = OfflineManager.getInstance();
      manager.cacheVersionInfo({ version: '1.0.0', displayVersion: '1.0.0', fullVersion: '1.0.0', buildDate: '2023', commitHash: 'abc', environment: 'test' });
      const stats = manager.getCacheStats();
      expect(stats.hasVersionCache).toBe(true);
      expect(stats.releaseNotesCount).toBe(0);
    });
  });

  describe('useOfflineState hook', () => {
    it('returns initial state', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      const { result } = renderHook(() => useOfflineState());
      expect(result.current.isOffline).toBe(false);
    });
  });
});
