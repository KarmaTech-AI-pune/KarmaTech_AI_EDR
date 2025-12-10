import React from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { useOutletContext, useParams } from 'react-router-dom';
import { OpportunityTracking } from '../../models';
import { OpportunityForm } from '../../components/forms/OpportunityForm';
import BidPreparationForm from '../../components/forms/BidPreparationForm';
import GoNoGoForm from '../../components/forms/GoNoGoForm';
import { opportunityApi } from '../../dummyapi/opportunityApi';
import { useBusinessDevelopment } from '../../context/BusinessDevelopmentContext';
import { OpportunityTrackingWorkflow } from '../../components/common/OpportunityTrackingWorkflow';

type ContextType = {
  opportunity: OpportunityTracking;
  handleOpportunityUpdate: () => void;
};

export const BFormRenderer: React.FC = () => {
  const { opportunity, handleOpportunityUpdate } = useOutletContext<ContextType>();
  const { formId } = useParams<{ formId: string }>();
  const { setGoNoGoDecisionStatus, setGoNoGoVersionNumber } = useBusinessDevelopment();

  const handleFormSubmit = async (data: OpportunityTracking) => {
    try {
      await opportunityApi.update(opportunity.id || 0, data as Partial<OpportunityTracking>);
      handleOpportunityUpdate();
    } catch (error) {
      console.error('Error updating opportunity:', error);
    }
  };

  switch (formId) {
    case 'opportunity-tracking':
      return (
        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Opportunity Tracking Form
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              View and edit opportunity tracking details for {opportunity.workName}
            </Typography>
            <OpportunityForm
              onSubmit={handleFormSubmit}
              project={opportunity}
              actionButtons={
                <OpportunityTrackingWorkflow
                  opportunity={opportunity}
                  onOpportunityUpdated={handleOpportunityUpdate}
                />
              }
            />
          </Paper>
        </Box>
      );
    case 'gonogo':
      return (
        <GoNoGoForm
          onDecisionStatusChange={(status, versionNumber) => {
            setGoNoGoDecisionStatus(status);
            setGoNoGoVersionNumber(versionNumber);
          }}
        />
      );
    case 'bid-preparation':
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Bid Preparation Form</Typography>
          <BidPreparationForm />
        </Box>
      );
    default:
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" color="error">
            Form not found
          </Typography>
        </Box>
      );
  }
};

export default BFormRenderer;
