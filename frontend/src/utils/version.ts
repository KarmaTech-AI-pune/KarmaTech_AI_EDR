/**
 * Version utilities for the application
 * Provides access to version information injected at build time
 */

// Global variables injected by Vite at build time
declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;

export interface VersionInfo {
  version: string;
  buildDate: string;
  displayVersion: string;
}

/**
 * Get application version information
 * @returns {VersionInfo} Version information object
 */
export function getVersionInfo(): VersionInfo {
  let version: string;
  let buildDate: string;

  try {
    // Try to use build-time injected values first (highest priority)
    if (typeof __APP_VERSION__ !== 'undefined' && __APP_VERSION__ !== 'unknown') {
      version = __APP_VERSION__;
    } else {
      // Fallback to environment variables
      version = import.meta.env.VITE_APP_VERSION || 
                import.meta.env.REACT_APP_VERSION || 
                'dev';
    }
    
    // Get build date from injection or use current time
    buildDate = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date().toISOString();
  } catch (error) {
    // Final fallback for development or if injection fails
    version = import.meta.env.VITE_APP_VERSION || 
              import.meta.env.REACT_APP_VERSION || 
              'dev';
    buildDate = new Date().toISOString();
  }

  return {
    version,
    buildDate,
    displayVersion: `v${version}`
  };
}

/**
 * Get just the version string for display
 * @returns {string} Formatted version string (e.g., "v1.12.0")
 */
export function getDisplayVersion(): string {
  return getVersionInfo().displayVersion;
}

/**
 * Get version for error reporting (includes build date)
 * @returns {string} Version with build date for debugging
 */
export function getVersionForErrorReporting(): string {
  const info = getVersionInfo();
  const buildDateShort = info.buildDate.split('T')[0]; // Just the date part
  return `${info.displayVersion} (${buildDateShort})`;
}

/**
 * Check if this is a development build
 * @returns {boolean} True if running in development
 */
export function isDevelopmentBuild(): boolean {
  const version = getVersionInfo().version;
  return version === 'dev' || version === 'unknown' || version.includes('dev');
}