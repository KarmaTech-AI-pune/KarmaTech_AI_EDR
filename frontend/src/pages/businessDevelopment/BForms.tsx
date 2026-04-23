import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import { useBusinessDevelopment } from '../../context/BusinessDevelopmentContext';

export const BForms: React.FC = () => {
  const navigate = useNavigate();
  const { opportunity, goNoGoDecisionStatus, goNoGoVersionNumber } = useBusinessDevelopment();

  const currentStatusId = Array.isArray(opportunity?.currentHistory)
    ? opportunity?.currentHistory[0]?.statusId
    : (opportunity?.currentHistory as any)?.statusId;

  const isOpportunityApproved = currentStatusId === 6;


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Forms Overview</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Opportunity Tracking</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Track and manage opportunity details, client information, and project specifics.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/business-development/details/forms/opportunity-tracking')}
              >
                View Form
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Go/No-Go Decision</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Evaluate project viability and make informed decisions on opportunity pursuit.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/business-development/details/forms/gonogo')}
                disabled={!isOpportunityApproved}
              >
                View Form
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Bid Preparation</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Prepare and manage bid documentation and submission details.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/business-development/details/forms/bid-preparation')}
                disabled={!(isOpportunityApproved && goNoGoDecisionStatus === "GO" && goNoGoVersionNumber === 3)}
              >
                View Form
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BForms;
