import React, { useState, useEffect, useCallback } from 'react';
import { Typography, TypographyProps, Tooltip, Skeleton, Box, IconButton, Alert, Snackbar } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { getVersionInfo, isDevelopmentBuild } from '../utils/version';
import { versionApi, VersionInfo as ApiVersionInfo } from '../services/versionApi';

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
  const [error, setError] = useState<string | null>(null);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);

  // Get fallback version info from build-time injection
  const fallbackVersionInfo = getVersionInfo();
  const isDev = isDevelopmentBuild();

  // Fetch version from API with basic error handling
  const fetchVersion = useCallback(async () => {
    if (!fetchVersionFromAPI) {
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

  // Handle retry button click
  const handleRetry = useCallback(() => {
    fetchVersion();
  }, [fetchVersion]);

  // Determine which version info to use
  const versionInfo = apiVersionInfo || {
    displayVersion: fallbackVersionInfo.displayVersion,
    buildDate: fallbackVersionInfo.buildDate,
    version: fallbackVersionInfo.version,
    environment: isDev ? 'dev' : 'prod'
  };

  const versionText = `${prefix} ${versionInfo.displayVersion}${isDev && showDevIndicator ? ' (dev)' : ''}`;

  // Create tooltip content
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

  const handleClick = () => {
    if (clickable && onVersionClick) {
      onVersionClick(versionInfo.version);
    }
  };

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
        aria-label={clickable ? `Version ${versionInfo.displayVersion}, click to view release notes` : undefined}
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