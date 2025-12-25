import React, { useState, useEffect, useCallback } from 'react';
import { Typography, TypographyProps, Tooltip, Skeleton, Box, IconButton, Alert, Snackbar, Chip } from '@mui/material';
import { Warning as WarningIcon, Refresh as RefreshIcon, WifiOff as OfflineIcon } from '@mui/icons-material';
import { getVersionInfo, isDevelopmentBuild } from '../utils/version';
import { versionApi, VersionInfo as ApiVersionInfo } from '../services/versionApi';
import { globalErrorHandler, ErrorInfo, createUserFriendlyMessage, shouldShowRetry, withErrorHandling } from '../utils/errorHandling';
import { globalOfflineManager, useOfflineState, createOfflineMessage } from '../utils/offlineSupport';

interface VersionDisplayProps extends Omit<TypographyProps, 'children'> {
  /** Show build date in tooltip */
  showBuildDate?: boolean;
  /** Prefix text before version */
  prefix?: string;
  /** Show development indicator */
  showDevIndicator?: boolean;
  /** Fetch version from API instead of build-time injection */
  fetchVersionFromAPI?: boolean;
  /** Make version clickable */
  clickable?: boolean;
  /** Callback when version is clicked */
  onVersionClick?: (version: string) => void;
}

/**
 * Reusable component for displaying application version
 * Automatically gets version from build-time injection or environment variables
 * Can optionally fetch version from API for real-time updates
 * Features comprehensive error handling with fallbacks and retry mechanisms
 * Includes offline support with cached data and offline indicators
 */
export const VersionDisplay: React.FC<VersionDisplayProps> = ({
  showBuildDate = true,
  prefix = 'Version',
  showDevIndicator = true,
  fetchVersionFromAPI = false,
  clickable = false,
  onVersionClick,
  ...typographyProps
}) => {
  const [apiVersionInfo, setApiVersionInfo] = useState<ApiVersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [usingCachedData, setUsingCachedData] = useState(false);

  // Get fallback version info from build-time injection
  const fallbackVersionInfo = getVersionInfo();
  const isDev = isDevelopmentBuild();
  
  // Use offline state hook
  const offlineState = useOfflineState();

  // Fetch version from API with comprehensive error handling and offline support
  const fetchVersionWithErrorHandling = useCallback(async () => {
    if (!fetchVersionFromAPI) {
      return;
    }

    // If offline, try to use cached data first
    if (offlineState.isOffline) {
      const cachedVersion = globalOfflineManager.getCachedVersionInfo();
      if (cachedVersion) {
        console.log('Using cached version info (offline mode)');
        setApiVersionInfo(cachedVersion);
        setUsingCachedData(true);
        return;
      }
    }

    setIsLoading(true);
    setErrorInfo(null);
    setUsingCachedData(false);

    try {
      const versionInfo = await withErrorHandling(
        () => versionApi.getCurrentVersion(),
        { 
          component: 'VersionDisplay',
          operation: 'fetchVersion',
          retryCount,
          isOffline: offlineState.isOffline
        },
        offlineState.isOffline ? 1 : 2 // Fewer retries when offline
      );
      
      setApiVersionInfo(versionInfo);
      setRetryCount(0); // Reset retry count on success
      
      // Cache the version info for offline use
      globalOfflineManager.cacheVersionInfo(versionInfo);
    } catch (error) {
      const errorInfo = globalErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { 
          component: 'VersionDisplay',
          operation: 'fetchVersion',
          retryCount,
          fallbackAvailable: true,
          isOffline: offlineState.isOffline
        }
      );
      
      setErrorInfo(errorInfo);
      
      // Try to use cached data as fallback
      const cachedVersion = globalOfflineManager.getCachedVersionInfo();
      if (cachedVersion) {
        console.log('Using cached version info as fallback');
        setApiVersionInfo(cachedVersion);
        setUsingCachedData(true);
      } else {
        setShowErrorSnackbar(true);
      }
      
      // Keep using fallback version when API fails
      console.warn('Using fallback version due to API error:', createUserFriendlyMessage(errorInfo));
    } finally {
      setIsLoading(false);
    }
  }, [fetchVersionFromAPI, retryCount, offlineState.isOffline]);

  // Fetch version from API if requested
  useEffect(() => {
    fetchVersionWithErrorHandling();
  }, [fetchVersionWithErrorHandling]);

  // Handle retry button click
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchVersionWithErrorHandling();
  }, [fetchVersionWithErrorHandling]);

  // Determine which version info to use
  const versionInfo = apiVersionInfo || {
    displayVersion: fallbackVersionInfo.displayVersion,
    buildDate: fallbackVersionInfo.buildDate,
    version: fallbackVersionInfo.version,
    environment: isDev ? 'dev' : 'prod'
  };

  const versionText = `${prefix} ${versionInfo.displayVersion}${isDev && showDevIndicator ? ' (dev)' : ''}`;

  // Create comprehensive tooltip content
  const createTooltipContent = () => {
    const parts: string[] = [];
    
    if (showBuildDate) {
      parts.push(`Build Date: ${new Date(versionInfo.buildDate).toLocaleString()}`);
    }
    
    if (offlineState.isOffline) {
      parts.push(`📡 ${createOfflineMessage(offlineState)}`);
    }
    
    if (usingCachedData) {
      parts.push('💾 Using cached data');
    }
    
    if (errorInfo) {
      parts.push(`⚠️ ${createUserFriendlyMessage(errorInfo)}`);
      if (shouldShowRetry(errorInfo) && !offlineState.isOffline) {
        parts.push('Click the warning icon to retry');
      }
    } else if (fetchVersionFromAPI && !apiVersionInfo && !usingCachedData) {
      parts.push('⚠️ Using fallback version');
    }
    
    return parts.join('\n');
  };

  const tooltipTitle = createTooltipContent();

  const handleClick = () => {
    if (clickable && onVersionClick) {
      onVersionClick(versionInfo.version);
    }
  };

  const handleCloseErrorSnackbar = () => {
    setShowErrorSnackbar(false);
  };

  // Show loading skeleton while fetching
  if (isLoading && fetchVersionFromAPI && !usingCachedData) {
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
          ...(errorInfo && !usingCachedData && {
            color: 'warning.main',
          }),
          ...(offlineState.isOffline && {
            color: 'text.disabled',
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
        aria-label={clickable ? `Version ${versionInfo.displayVersion}, click to view release notes` : undefined}
        {...typographyProps}
      >
        {versionText}
      </Typography>
      
      {/* Offline indicator */}
      {offlineState.isOffline && (
        <Tooltip title={createOfflineMessage(offlineState)}>
          <OfflineIcon 
            fontSize="small" 
            sx={{ 
              color: 'text.disabled',
              ml: 0.5
            }}
          />
        </Tooltip>
      )}
      
      {/* Cached data indicator */}
      {usingCachedData && !offlineState.isOffline && (
        <Chip
          label="Cached"
          size="small"
          variant="outlined"
          sx={{ 
            height: 16,
            fontSize: '0.6rem',
            ml: 0.5,
            color: 'text.secondary',
            borderColor: 'text.secondary'
          }}
        />
      )}
      
      {/* Warning icon with retry functionality */}
      {errorInfo && !usingCachedData && (
        <Tooltip title={shouldShowRetry(errorInfo) && !offlineState.isOffline ? 'Click to retry' : 'Error occurred'}>
          <IconButton
            size="small"
            onClick={shouldShowRetry(errorInfo) && !offlineState.isOffline ? handleRetry : undefined}
            sx={{ 
              p: 0.25,
              color: 'warning.main',
              cursor: shouldShowRetry(errorInfo) && !offlineState.isOffline ? 'pointer' : 'default'
            }}
            disabled={isLoading || offlineState.isOffline}
            aria-label={shouldShowRetry(errorInfo) && !offlineState.isOffline ? 'Retry fetching version' : 'Version error'}
          >
            {shouldShowRetry(errorInfo) && !offlineState.isOffline ? <RefreshIcon fontSize="small" /> : <WarningIcon fontSize="small" />}
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
            errorInfo && shouldShowRetry(errorInfo) && !offlineState.isOffline ? (
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
          Version API: {errorInfo ? createUserFriendlyMessage(errorInfo) : 'Unknown error'}
          {offlineState.isOffline && ' (Offline mode)'}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VersionDisplay;