import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Warning,
  Schedule,
  Assessment
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: 'revenue' | 'profit' | 'risk' | 'approvals' | 'trending' | 'assessment';
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  subtitle
}) => {
  const theme = useTheme();

  const getIcon = () => {
    const iconProps = { sx: { fontSize: 24 } };
    switch (icon) {
      case 'revenue':
        return <AttachMoney {...iconProps} />;
      case 'profit':
        return <Assessment {...iconProps} />;
      case 'risk':
        return <Warning {...iconProps} />;
      case 'approvals':
        return <Schedule {...iconProps} />;
      case 'trending':
        return <TrendingUp {...iconProps} />;
      default:
        return <Assessment {...iconProps} />;
    }
  };

  const getIconColor = () => {
    switch (icon) {
      case 'revenue':
        return theme.palette.success.main;
      case 'profit':
        return theme.palette.primary.main;
      case 'risk':
        return theme.palette.error.main;
      case 'approvals':
        return theme.palette.warning.main;
      case 'trending':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return theme.palette.success.main;
      case 'negative':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />;
    }
    if (changeType === 'negative') {
      return <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />;
    }
    return null;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          gap: 1.5
        }}>
          <Box sx={{ 
            flex: 1,
            minWidth: 0,
            pr: 0.5
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              fontWeight="medium"
              sx={{ 
                mb: 1,
                lineHeight: 1.3,
                wordBreak: 'break-word'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color="text.primary"
              sx={{ mb: 1 }}
            >
              {value}
            </Typography>
            {change && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: getChangeColor()
              }}>
                {getChangeIcon()}
                <Typography variant="body2" fontWeight="medium">
                  {change}
                </Typography>
              </Box>
            )}
            {subtitle && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${getIconColor()}15`,
              color: getIconColor(),
              width: 56,
              height: 56,
              flexShrink: 0
            }}
          >
            {getIcon()}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
