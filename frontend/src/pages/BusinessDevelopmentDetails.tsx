import { useContext } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { projectManagementAppContext } from '../App';
import { BusinessDevelopmentWidget } from '../components/widgets/BusinessDevelopmentWidget';
import { HistoryWidget } from '../components/widgets/HistoryWidget';
import { OpportunityTracking } from '../types';
import { getHistoriesByOpportunityId } from '../dummyapi/database/dummyOpportunityHistory';

export const BusinessDevelopmentDetails = () => {
  const context = useContext(projectManagementAppContext);
  const opportunity = context?.selectedProject as OpportunityTracking;

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
        <Typography variant="h4" gutterBottom>
          {opportunity.workName}
        </Typography>
        
        <BusinessDevelopmentWidget opportunity={opportunity} />
        <HistoryWidget histories={histories} title={`History - ${opportunity.workName}`} />
      </Box>
    </Container>
  );
};
