import React from 'react';
import { Typography, TypographyProps, Tooltip } from '@mui/material';
import { getVersionInfo, isDevelopmentBuild } from '../utils/version';

interface VersionDisplayProps extends Omit<TypographyProps, 'children'> {
  /** Show build date in tooltip */
  showBuildDate?: boolean;
  /** Prefix text before version */
  prefix?: string;
  /** Show development indicator */
  showDevIndicator?: boolean;
}

/**
 * Reusable component for displaying application version
 * Automatically gets version from build-time injection or environment variables
 */
export const VersionDisplay: React.FC<VersionDisplayProps> = ({
  showBuildDate = true,
  prefix = 'Version',
  showDevIndicator = true,
  ...typographyProps
}) => {
  const versionInfo = getVersionInfo();
  const isDev = isDevelopmentBuild();

  const versionText = `${prefix} ${versionInfo.displayVersion}${isDev && showDevIndicator ? ' (dev)' : ''}`;

  const tooltipTitle = showBuildDate 
    ? `Build Date: ${new Date(versionInfo.buildDate).toLocaleString()}`
    : '';

  const versionElement = (
    <Typography
      variant="body2"
      color="text.secondary"
      {...typographyProps}
    >
      {versionText}
    </Typography>
  );

  if (showBuildDate && tooltipTitle) {
    return (
      <Tooltip title={tooltipTitle} arrow>
        {versionElement}
      </Tooltip>
    );
  }

  return versionElement;
};

export default VersionDisplay;