import React, { useState, useEffect, useContext } from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  CircularProgress, 
  Alert, 
  Grid, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails 
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  WorkOutline as WorkOutlineIcon 
} from '@mui/icons-material';
import { OpportunityTracking } from '../types';
import { projectManagementAppContext } from '../App';
import { UserRole } from '../dummyapi/database/dummyusers';
import { opportunityApi } from '../dummyapi/opportunityApi';

export const Opportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<OpportunityTracking[]>([]);
  const [expandedOpportunityId, setExpandedOpportunityId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const context = useContext(projectManagementAppContext);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setIsLoading(true);
        
        // If logged in user is a Regional Manager, filter opportunities
        if (context?.user?.role === UserRole.RegionalManager && context.user.id) {
          // Get opportunities for this user
          console.log("RM")
          const userOpportunities = await opportunityApi.getByUserId(context.user.id);
          setOpportunities(userOpportunities);
        } else {
          console.log("not RM")
          // Get all opportunities for other roles
          const allOpportunities = await opportunityApi.getAll();
          setOpportunities(allOpportunities);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load opportunities');
        setIsLoading(false);
      }
    };

    loadOpportunities();
  }, [context?.user]);

  const toggleOpportunityExpansion = (opportunityId: number) => {
    setExpandedOpportunityId(expandedOpportunityId === opportunityId ? null : opportunityId);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: 'text.primary' 
          }}
        >
          <WorkOutlineIcon sx={{ mr: 2, fontSize: 36, color: 'primary.main' }} />
          Opportunities
        </Typography>
      </Box>

      {opportunities.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ 
            '& .MuiAlert-icon': { color: 'primary.main' } 
          }}
        >
          No opportunities found.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {opportunities.map(opportunity => (
            <Grid item xs={12} key={opportunity.id}>
              <Accordion 
                expanded={expandedOpportunityId === opportunity.id}
                onChange={() => toggleOpportunityExpansion(opportunity.id)}
                sx={{ 
                  boxShadow: 'none', 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  '&:before': { display: 'none' } 
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.02)', 
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' } 
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <Typography variant="h6" color="text.primary">
                        {opportunity.workName}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="body2" color="text.secondary">
                        {opportunity.status}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1">Client: {opportunity.client}</Typography>
                  <Typography variant="body1">Client Sector: {opportunity.clientSector}</Typography>
                  <Typography variant="body1">Operation: {opportunity.operation}</Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Opportunities;
