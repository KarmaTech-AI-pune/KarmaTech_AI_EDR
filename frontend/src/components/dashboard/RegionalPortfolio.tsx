import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { RegionalData } from '../../data/types/dashboard';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface RegionalPortfolioProps {
  data: RegionalData[];
}

const RegionalPortfolio: React.FC<RegionalPortfolioProps> = ({ data }) => {
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
          Regional Portfolio
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2 : 3 }}>
          {data.map((region) => (
            <Box key={region.region} sx={{ pb: isMobile ? 1.5 : 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="medium"
                  sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}
                >
                  {region.region}
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="semibold" 
                  color="success.main"
                  sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                >
                  {formatPercentage(region.profit)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2, mb: 1 }}>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                >
                  Q4: {region.q4} projects
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                >
                  {formatCurrency(region.revenue)} revenue
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(region.profit / 25) * 100} // Assuming max profit for visual scale is 25%
                sx={{
                  height: isMobile ? 6 : 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RegionalPortfolio;
