import React from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
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
  const { setGoNoGoDecisionStatus, setGoNoGoVersionNumber, goNoGoDecisionStatus, goNoGoVersionNumber } = useBusinessDevelopment();

  const currentStatusId = Array.isArray(opportunity?.currentHistory)
    ? opportunity?.currentHistory[0]?.statusId
    : (opportunity?.currentHistory as any)?.statusId;

  const isOpportunityApproved = currentStatusId === 6;
  const isBidPreparationUnlocked =
    isOpportunityApproved && goNoGoDecisionStatus === 'GO' && goNoGoVersionNumber === 3;

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
      if (!isBidPreparationUnlocked) {
        return (
          <Box
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 300,
              gap: 2,
            }}
          >
            <LockIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography variant="h6" color="text.secondary">
              Bid Preparation Locked
            </Typography>
            <Typography variant="body2" color="text.disabled" textAlign="center">
              Bid Preparation is only available after the Opportunity Tracking is approved
              and the Go/No-Go Decision receives an RD-approved "GO" outcome.
            </Typography>
          </Box>
        );
      }
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
