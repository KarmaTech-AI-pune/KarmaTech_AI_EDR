import React, { useState, useEffect, useCallback } from 'react';
import { Typography, TypographyProps, Tooltip, Skeleton, Box, IconButton, Alert, Snackbar } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { getVersionInfo, isDevelopmentBuild } from '../utils/version';
import { versionApi, VersionInfo as ApiVersionInfo } from '../services/versionApi';

/**
 * Props interface for the VersionDisplay component
 * Extends Material-UI Typography props while omitting 'children' to control content
 */
interface VersionDisplayProps extends Omit<TypographyProps, 'children'> {
  /** 
   * Show build date in tooltip when hovering over version
   * @default true
   */
  showBuildDate?: boolean;

  /** 
   * Prefix text displayed before the version number
   * @default "Version"
   */
  prefix?: string;

  /** 
   * Show development indicator (e.g., "(dev)") for development builds
   * @default true
   */
  showDevIndicator?: boolean;

  /** 
   * Fetch version from API instead of using build-time injection
   * When true, makes API call to get current deployed version
   * @default false
   */
  fetchVersionFromAPI?: boolean;

  /** 
   * Make version text clickable with hover effects
   * @default false
   */
  clickable?: boolean;

  /** 
   * Callback function called when version is clicked (requires clickable=true)
   * @param version - The semantic version string (e.g., "1.0.38")
   */
  onVersionClick?: (version: string) => void;

  /**
   * Manually override the displayed version text.
   * If provided, this string is used directly, bypassing API checks.
   */
  forceVersion?: string;
}

/**
 * VersionDisplay Component
 * 
 * A reusable React component for displaying application version information with enhanced features:
 * - Displays version from build-time injection or live API
 * - Interactive clickable version with hover effects
 * - Loading states and error handling with retry functionality
 * - Comprehensive tooltip with build information
 * - Accessibility support (keyboard navigation, ARIA labels)
 * - Responsive design and Material-UI integration
 * 
 * @example
 * ```tsx
 * // Basic usage with build-time version
 * <VersionDisplay />
 * 
 * // Interactive version with API fetching
 * <VersionDisplay 
 *   fetchVersionFromAPI={true}
 *   clickable={true}
 *   onVersionClick={(version) => openReleaseNotes(version)}
 * />
 * 
 * // Custom styling and prefix
 * <VersionDisplay 
 *   prefix="App Version"
 *   variant="h6"
 *   color="primary"
 *   showBuildDate={false}
 * />
 * ```
 * 
 * @component
 * @since 1.0.38
 * @author Interactive Version Display Feature Team
 * 
 * Requirements Coverage:
 * - 1.1: Dynamic version fetching from API
 * - 1.3: Fallback version with error indication  
 * - 1.4: Replace hardcoded version with dynamic version
 * - 2.1: Visual feedback for clickable version
 * - 2.2: Click handler to trigger callback
 * - 5.4: Loading states and error handling
 */
export const VersionDisplay: React.FC<VersionDisplayProps> = ({
  showBuildDate = true,
  prefix = 'Version',
  showDevIndicator = true,
  fetchVersionFromAPI = false,
  clickable = false,
  onVersionClick,
  forceVersion,
  ...typographyProps
}) => {
  const [apiVersionInfo, setApiVersionInfo] = useState<ApiVersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);

  // Get fallback version info from build-time injection
  const fallbackVersionInfo = getVersionInfo();
  const isDev = isDevelopmentBuild();

  /**
   * Fetches version from API with comprehensive error handling and retry logic
   * Includes timeout management and user-friendly error messages
   */
  const fetchVersion = useCallback(async () => {
    if (!fetchVersionFromAPI || forceVersion) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const versionInfo = await versionApi.getCurrentVersion();
      setApiVersionInfo(versionInfo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch version';
      setError(errorMessage);
      setShowErrorSnackbar(true);
      console.warn('Using fallback version due to API error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchVersionFromAPI]);

  // Fetch version from API if requested
  useEffect(() => {
    fetchVersion();
  }, [fetchVersion]);

  /**
   * Handles retry button click with loading state management
   */
  const handleRetry = useCallback(() => {
    fetchVersion();
  }, [fetchVersion]);

  /**
   * Determines which version info to use (API or fallback)
   * Provides consistent interface regardless of data source
   */
  const versionInfo = forceVersion
    ? {
      displayVersion: forceVersion.startsWith('v') ? forceVersion : `v${forceVersion}`,
      buildDate: new Date().toISOString(),
      version: forceVersion,
      environment: 'manual-override',
      fullVersion: forceVersion,
      commitHash: 'manual'
    } as ApiVersionInfo
    : (apiVersionInfo || {
      displayVersion: fallbackVersionInfo.displayVersion,
      buildDate: fallbackVersionInfo.buildDate,
      version: fallbackVersionInfo.version,
      environment: isDev ? 'dev' : 'prod',
      fullVersion: fallbackVersionInfo.version,
      commitHash: 'unknown'
    } as unknown as ApiVersionInfo);

  const versionText = `${prefix} ${versionInfo.displayVersion.split('-')[0].replace('v', '')}`;

  /**
   * Creates tooltip content with build information and error states
   * @returns Formatted tooltip text with build date and error information
   */
  const createTooltipContent = () => {
    const parts: string[] = [];

    if (showBuildDate) {
      parts.push(`Build Date: ${new Date(versionInfo.buildDate).toLocaleString()}`);
    }

    if (error && !apiVersionInfo) {
      parts.push(`⚠️ ${error}`);
      parts.push('Click the warning icon to retry');
    } else if (fetchVersionFromAPI && !apiVersionInfo) {
      parts.push('⚠️ Using fallback version');
    }

    return parts.join('\n');
  };

  const tooltipTitle = createTooltipContent();

  /**
   * Handles version click event for interactive mode
   * Calls onVersionClick callback with semantic version string
   */
  const handleClick = () => {
    if (clickable && onVersionClick) {
      onVersionClick(versionInfo.version);
    }
  };

  /**
   * Handles error snackbar close event
   */
  const handleCloseErrorSnackbar = () => {
    setShowErrorSnackbar(false);
  };

  // Show loading skeleton while fetching
  if (isLoading && fetchVersionFromAPI) {
    return (
      <Box sx={{ display: 'inline-block' }}>
        <Skeleton
          variant="text"
          width={120}
          height={20}
          data-testid="version-skeleton"
          sx={{
            display: 'inline-block',
            verticalAlign: 'baseline'
          }}
        />
      </Box>
    );
  }

  const versionElement = (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        onClick={handleClick}
        sx={{
          ...(clickable && {
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
              color: 'primary.main',
            },
            transition: 'color 0.2s ease-in-out',
          }),
          ...(error && !apiVersionInfo && {
            color: 'warning.main',
          }),
        }}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={clickable ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        } : undefined}
        aria-label={clickable ? `${versionText}, click to view release notes` : undefined}
        {...typographyProps}
      >
        {versionText}
      </Typography>

      {/* Warning icon with retry functionality */}
      {error && !apiVersionInfo && (
        <Tooltip title="Click to retry">
          <IconButton
            size="small"
            onClick={handleRetry}
            sx={{
              p: 0.25,
              color: 'warning.main'
            }}
            disabled={isLoading}
            aria-label="Retry fetching version"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  return (
    <>
      {tooltipTitle ? (
        <Tooltip title={tooltipTitle} arrow>
          {versionElement}
        </Tooltip>
      ) : (
        versionElement
      )}

      {/* Error notification snackbar */}
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseErrorSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseErrorSnackbar}
          severity="warning"
          sx={{ width: '100%' }}
          action={
            error ? (
              <IconButton
                size="small"
                aria-label="retry"
                color="inherit"
                onClick={() => {
                  handleCloseErrorSnackbar();
                  handleRetry();
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            ) : undefined
          }
        >
          Version API: {error || 'Unknown error'}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VersionDisplay;