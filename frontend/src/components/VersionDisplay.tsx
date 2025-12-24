import React, { useState, useEffect } from 'react';
import { Typography, TypographyProps, Tooltip, Skeleton, Box } from '@mui/material';
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
  const [hasError, setHasError] = useState(false);

  // Get fallback version info from build-time injection
  const fallbackVersionInfo = getVersionInfo();
  const isDev = isDevelopmentBuild();

  // Fetch version from API if requested
  useEffect(() => {
    if (!fetchVersionFromAPI) {
      return;
    }

    const fetchVersion = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        const versionInfo = await versionApi.getCurrentVersion();
        setApiVersionInfo(versionInfo);
      } catch (error) {
        console.error('Failed to fetch version from API:', error);
        setHasError(true);
        // Keep using fallback version
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersion();
  }, [fetchVersionFromAPI]);

  // Determine which version info to use
  const versionInfo = apiVersionInfo || {
    displayVersion: fallbackVersionInfo.displayVersion,
    buildDate: fallbackVersionInfo.buildDate,
    version: fallbackVersionInfo.version,
    environment: isDev ? 'dev' : 'prod'
  };

  const versionText = `${prefix} ${versionInfo.displayVersion}${isDev && showDevIndicator ? ' (dev)' : ''}`;

  const tooltipTitle = showBuildDate 
    ? `Build Date: ${new Date(versionInfo.buildDate).toLocaleString()}${hasError ? '\n⚠️ Using fallback version' : ''}`
    : hasError ? '⚠️ Using fallback version' : '';

  const handleClick = () => {
    if (clickable && onVersionClick) {
      onVersionClick(versionInfo.version);
    }
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
        ...(hasError && {
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
  );

  if ((showBuildDate && tooltipTitle) || hasError) {
    return (
      <Tooltip title={tooltipTitle} arrow>
        {versionElement}
      </Tooltip>
    );
  }

  return versionElement;
};

export default VersionDisplay;