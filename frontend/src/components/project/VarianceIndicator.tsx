/**
 * VarianceIndicator Component
 * 
 * Displays budget variance with visual indicators.
 * Features:
 * - Color coding for positive/negative changes
 * - Percentage and absolute variance display
 * - Currency formatting support
 * 
 * Requirements: 2.5, 3.3
 */

import React from 'react';
import { Box, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';

interface VarianceIndicatorProps {
  variance: number;
  percentageVariance: number;
  currency?: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export const VarianceIndicator: React.FC<VarianceIndicatorProps> = ({
  variance,
  percentageVariance,
  currency = 'USD',
  size = 'medium',
  showIcon = true,
}) => {
  // Determine color based on variance
  const getVarianceColor = (): 'success' | 'error' | 'default' => {
    if (variance > 0) return 'success';
    if (variance < 0) return 'error';
    return 'default';
  };

  // Get icon based on variance
  const getVarianceIcon = () => {
    if (variance > 0) return <TrendingUpIcon fontSize={size} />;
    if (variance < 0) return <TrendingDownIcon fontSize={size} />;
    return <RemoveIcon fontSize={size} />;
  };

  // Format currency value
  const formatCurrency = (value: number): string => {
    const absValue = Math.abs(value);
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(absValue);
    } catch (error) {
      // Handle invalid currency code gracefully
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(absValue);
    }
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    const absValue = Math.abs(value);
    return `${absValue.toFixed(2)}%`;
  };

  // Get display text
  const getDisplayText = (): string => {
    const sign = variance > 0 ? '+' : variance < 0 ? '-' : '';
    const currencyText = formatCurrency(variance);
    const percentageText = formatPercentage(percentageVariance);
    return `${sign}${currencyText} (${sign}${percentageText})`;
  };

  const color = getVarianceColor();
  const icon = showIcon ? getVarianceIcon() : undefined;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showIcon && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color:
              color === 'success'
                ? 'success.main'
                : color === 'error'
                ? 'error.main'
                : 'text.secondary',
          }}
        >
          {icon}
        </Box>
      )}
      <Chip
        label={getDisplayText()}
        color={color}
        size={size === 'large' ? 'medium' : 'small'}
        sx={{
          fontWeight: size === 'large' ? 'bold' : 'normal',
          fontSize: size === 'large' ? '1rem' : size === 'medium' ? '0.875rem' : '0.75rem',
        }}
      />
    </Box>
  );
};

/**
 * Compact version of VarianceIndicator for use in tables or tight spaces
 */
export const CompactVarianceIndicator: React.FC<VarianceIndicatorProps> = (props) => {
  return <VarianceIndicator {...props} size="small" showIcon={false} />;
};

/**
 * Large version of VarianceIndicator for use in headers or emphasis
 */
export const LargeVarianceIndicator: React.FC<VarianceIndicatorProps> = (props) => {
  return <VarianceIndicator {...props} size="large" showIcon={true} />;
};

export default VarianceIndicator;
