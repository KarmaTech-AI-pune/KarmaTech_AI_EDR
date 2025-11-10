import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { FinancialMetrics } from '../../data/types/dashboard';
import { formatCurrency } from '../../utils/formatters';

interface NPVProfitabilityProps {
  metrics: FinancialMetrics;
}

const NPVProfitability: React.FC<NPVProfitabilityProps> = ({ metrics }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Typography 
          variant="h6" 
          fontWeight="semibold" 
          sx={{ 
            mb: isMobile ? 2 : 3,
            fontSize: isMobile ? '1.1rem' : '1.25rem',
            lineHeight: isMobile ? 1.3 : 1.2
          }}
        >
          NPV & Profitability
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2 : 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              p: isMobile ? 1.5 : 2, 
              backgroundColor: '#e8f5e8', 
              borderRadius: 2 
            }}
          >
            <Box>
              <Typography 
                variant="body2" 
                fontWeight="medium" 
                color="success.dark"
                sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
              >
                Current NPV
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                color="success.main"
                sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}
              >
                {formatCurrency(metrics.totalRevenue)}
              </Typography>
            </Box>
            <TrendingUp sx={{ fontSize: isMobile ? 32 : 40, color: theme.palette.success.main }} />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 1 : 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
              >
                High Profit (20%+)
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight="medium" 
                color="success.main"
                sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
              >
                8 projects
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
              >
                Medium Profit (10-20%)
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight="medium" 
                color="warning.main"
                sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
              >
                12 projects
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
              >
                Low Profit (5-10%)
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight="medium" 
                color="error.main"
                sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
              >
                5 projects
              </Typography>
            </Box>
          </Box>

          <Box 
            sx={{ 
              p: isMobile ? 1.5 : 2, 
              backgroundColor: '#e8eaf5ff', 
              borderRadius: 2 
            }}
          >
            <Typography 
              variant="body2" 
              fontWeight="medium" 
              color="primary.dark"
              sx={{ mb: 0.5, fontSize: isMobile ? '0.8rem' : '0.875rem' }}
            >
              What-If Analysis
            </Typography>
            <Typography 
              variant="caption" 
              color="primary.main"
              sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
            >
              If approval delays reduced by 50%, NPV could increase by $340K
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NPVProfitability;
