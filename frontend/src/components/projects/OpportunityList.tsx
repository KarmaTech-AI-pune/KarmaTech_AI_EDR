import React from 'react';
import { 
  Typography, 
  List,
  Box,
} from '@mui/material';
import { OpportunityItem } from './OpportunityItem';
import { OpportunityTracking } from '../../models';

interface OpportunityListProps {
  opportunities: OpportunityTracking[];
  emptyMessage?: string;
  onOpportunityDeleted?: (opportunityId: string) => void;
  onOpportunityUpdated?: () => void;
}

export const OpportunityList: React.FC<OpportunityListProps> = ({ 
  opportunities,
  emptyMessage = 'No opportunities found',
  onOpportunityDeleted,
  onOpportunityUpdated
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      overflow: 'visible'
    }}>
      <Box sx={{ 
        flexGrow: 1,
        width: '100%',
        overflow: 'visible'
      }}>
        {opportunities.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column"
            justifyContent="center" 
            alignItems="center" 
            minHeight="200px"
            width="100%"
          >
            <Typography variant="body1">
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          <List sx={{ 
            width: '100%',
            '& > *:not(:last-child)': {
              mb: 1
            }
          }}>
            {opportunities.map(opportunity => (
              <OpportunityItem 
                key={opportunity.id} 
                opportunity={opportunity} 
                onOpportunityDeleted={onOpportunityDeleted}
                onOpportunityUpdated={onOpportunityUpdated}
              />
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default OpportunityList;
