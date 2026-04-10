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
import { formatCurrency } from '../../utils/formatters';
import { NpvProfitabilityDto } from '../../services/dashboardService';

interface NPVProfitabilityProps {
  data: NpvProfitabilityDto | null;
  currencyCode?: string;
}

const NPVProfitability: React.FC<NPVProfitabilityProps> = ({ data, currencyCode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!data) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    );
  }

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
                {formatCurrency(data.currentNpv, currencyCode)}
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
                {data.highProfitProjectsCount} projects
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
                {data.mediumProfitProjectsCount} projects
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
                {data.lowProfitProjectsCount} projects
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
              {data.whatIfAnalysis}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NPVProfitability;
