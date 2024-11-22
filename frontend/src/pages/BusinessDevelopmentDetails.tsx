import { useContext, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { projectManagementAppContext } from '../App';
import { BusinessDevelopmentWidget } from '../components/widgets/BusinessDevelopmentWidget';
import { HistoryWidget } from '../components/widgets/HistoryWidget';
import { OpportunityTracking } from '../types';
import { getHistoriesByOpportunityId } from '../dummyapi/database/dummyOpportunityHistory';
import { OpportunityTrackingWorkflow } from '../components/common/OpportunityTrackingWorkflow';
import { opportunityApi } from '../dummyapi/opportunityApi';

export const BusinessDevelopmentDetails = () => {
  const context = useContext(projectManagementAppContext);
  const opportunity = context?.selectedProject as OpportunityTracking;

  const handleOpportunityUpdate = async () => {
    if (opportunity && context?.setSelectedProject) {
      try {
        const updatedOpportunity = await opportunityApi.getById(opportunity.id);
        if (updatedOpportunity) {
          context.setSelectedProject(updatedOpportunity);
        }
      } catch (error) {
        console.error('Error refreshing opportunity:', error);
      }
    }
  };

  if (!opportunity) {
    return (
      <Container>
        <Typography variant="h6">No opportunity data found</Typography>
      </Container>
    );
  }

  const histories = getHistoriesByOpportunityId(opportunity.id);

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {opportunity.workName}
          </Typography>
          <OpportunityTrackingWorkflow 
            opportunity={opportunity} 
            onOpportunityUpdated={handleOpportunityUpdate}
          />
        </Box>
        
        <BusinessDevelopmentWidget opportunity={opportunity} />
        <HistoryWidget histories={histories} title={`History - ${opportunity.workName}`} />
      </Box>
    </Container>
  );
};
