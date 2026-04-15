import React from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useBusinessDevelopment } from '../context/BusinessDevelopmentContext';
import { BDSideMenu } from '../components/layout/BDSideMenu';
// import { BDChips } from '../components/common/BDChips';

const NAVBAR_HEIGHT = '64px';

export const BusinessDevelopmentDetails: React.FC = () => {
  const { opportunity, histories, handleOpportunityUpdate, isLoading, error } = useBusinessDevelopment();

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!opportunity) {
    return (
      <Container>
        <Alert severity="warning">No opportunity selected</Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: `calc(100vh - ${NAVBAR_HEIGHT})`,
        pt: `${NAVBAR_HEIGHT}`,
        bgcolor: 'background.default'
      }}
    >
      <BDSideMenu />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
          width: '100%',
          overflowX: 'auto',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {opportunity.workName}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
            <BDChips opportunityId={opportunity.id || 0} />
          </Box>
          <Outlet context={{ opportunity, histories, handleOpportunityUpdate }} />
        </Box>
      </Box>
    </Box>
  );
};

export default BusinessDevelopmentDetails;
