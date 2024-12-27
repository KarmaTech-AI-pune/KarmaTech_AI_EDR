import { useContext } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { projectManagementAppContext } from '../App';
import { BusinessDevelopmentWidget } from '../components/widgets/BusinessDevelopmentWidget';
import { HistoryWidget } from '../components/widgets/HistoryWidget';
import { OpportunityTracking } from '../models';
import { getHistoriesByOpportunityId } from '../dummyapi/database/dummyOpportunityHistory';
import { OpportunityTrackingWorkflow } from '../components/common/OpportunityTrackingWorkflow';
import { BDChips } from '../components/common/BDChips';
import { opportunityApi } from '../dummyapi/opportunityApi';

const NAVBAR_HEIGHT = '64px';

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

  const handleGoNoGoClick = () => {
    if (context?.setScreenState) {
      context.setScreenState("GoNoGo Form");
    }
  };

  const handleBidPrepClick = () => {
    if (context?.setScreenState) {
      context.setScreenState("Bid Preparation Form");
    }
  };

  if (!opportunity) {
    return (
      <Box sx={{ pt: `${NAVBAR_HEIGHT}`, p: 3 }}>
        <Typography variant="h6">No opportunity data found</Typography>
      </Box>
    );
  }

  const histories = getHistoriesByOpportunityId(opportunity.id.toString());

  return (
    <Box 
      sx={{ 
        minHeight: `calc(100vh - ${NAVBAR_HEIGHT})`,
        pt: `${NAVBAR_HEIGHT}`,
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">
              {opportunity.workName}
            </Typography>
            <OpportunityTrackingWorkflow 
              opportunity={opportunity} 
              onOpportunityUpdated={handleOpportunityUpdate}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <BDChips opportunityId={opportunity.id} />
          </Box>
        </Box>
        
        <BusinessDevelopmentWidget opportunity={opportunity} />
        <HistoryWidget histories={histories} title={`History - ${opportunity.workName}`} />
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleGoNoGoClick}
          >
            Go to GoNoGo Form
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleBidPrepClick}
          >
            Go to Bid Preparation Form
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
