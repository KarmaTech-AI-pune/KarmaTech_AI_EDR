import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  showPercentage = true,
  color = 'primary',
  height = 8
}) => {
  const theme = useTheme();
  const percentage = Math.round((value / max) * 100);

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {showPercentage && (
            <Typography variant="body2" fontWeight="medium">
              {percentage}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{
          height,
          borderRadius: height / 2,
          backgroundColor: theme.palette.grey[200],
          '& .MuiLinearProgress-bar': {
            borderRadius: height / 2,
          }
        }}
      />
    </Box>
  );
};

export default ProgressBar;
