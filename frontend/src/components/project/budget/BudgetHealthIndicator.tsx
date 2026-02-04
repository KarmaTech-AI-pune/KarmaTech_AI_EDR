/**
 * BudgetHealthIndicator Component
 * 
 * Displays project budget health status with color-coded visual indicators.
 * Features:
 * - Color coding: Green (Healthy), Yellow (Warning), Red (Critical)
 * - Utilization percentage display
 * - Material-UI Chip component
 * - Responsive sizing options
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import React from 'react';
import { Chip, Box, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { BudgetHealthStatus } from '../../../types/budgetHealth';

interface BudgetHealthIndicatorProps {
  status: BudgetHealthStatus;
  utilizationPercentage: number;
  size?: 'small' | 'medium';
  showIcon?: boolean;
  showTooltip?: boolean;
}

export const BudgetHealthIndicator: React.FC<BudgetHealthIndicatorProps> = ({
  status,
  utilizationPercentage,
  size = 'medium',
  showIcon = true,
  showTooltip = true,
}) => {
  // Determine color based on status (Requirements: 2.1, 2.2, 2.3)
  const getStatusColor = (): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'Healthy':
        return 'success'; // Green
      case 'Warning':
        return 'warning'; // Yellow
      case 'Critical':
        return 'error'; // Red
      default:
        return 'success';
    }
  };

  // Get icon based on status
  const getStatusIcon = () => {
    const iconSize = size === 'small' ? 'small' : 'medium';
    switch (status) {
      case 'Healthy':
        return <CheckCircleIcon fontSize={iconSize} />;
      case 'Warning':
        return <WarningIcon fontSize={iconSize} />;
      case 'Critical':
        return <ErrorIcon fontSize={iconSize} />;
      default:
        return <CheckCircleIcon fontSize={iconSize} />;
    }
  };

  // Format utilization percentage (Requirement: 2.4)
  const formatUtilization = (): string => {
    return `${utilizationPercentage.toFixed(1)}%`;
  };

  // Get tooltip text
  const getTooltipText = (): string => {
    switch (status) {
      case 'Healthy':
        return `Budget is healthy. Utilization: ${formatUtilization()} (< 90%)`;
      case 'Warning':
        return `Budget needs attention. Utilization: ${formatUtilization()} (90-100%)`;
      case 'Critical':
        return `Budget is over! Utilization: ${formatUtilization()} (> 100%)`;
      default:
        return `Utilization: ${formatUtilization()}`;
    }
  };

  const color = getStatusColor();
  const icon = showIcon ? getStatusIcon() : undefined;
  const label = `${status} (${formatUtilization()})`;

  const chipComponent = (
    <Chip
      label={label}
      color={color}
      size={size}
      icon={icon}
      sx={{
        fontWeight: 'medium',
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        '& .MuiChip-icon': {
          marginLeft: '8px',
        },
      }}
    />
  );

  // Wrap with tooltip if enabled
  if (showTooltip) {
    return (
      <Tooltip title={getTooltipText()} arrow placement="top">
        <Box sx={{ display: 'inline-flex' }}>{chipComponent}</Box>
      </Tooltip>
    );
  }

  return <Box sx={{ display: 'inline-flex' }}>{chipComponent}</Box>;
};

/**
 * Compact version of BudgetHealthIndicator for use in tables or tight spaces
 */
export const CompactBudgetHealthIndicator: React.FC<
  Omit<BudgetHealthIndicatorProps, 'size'>
> = (props) => {
  return <BudgetHealthIndicator {...props} size="small" />;
};

export default BudgetHealthIndicator;
