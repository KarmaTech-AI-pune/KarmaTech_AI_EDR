import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  Paper, 
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
import { projectApi } from '../dummyapi/api';
import { Project, ProjectStatus } from '../types';
import OpportunityTrackingWidget from '../components/widgets/OpportunityTrackingWidget';

export const Opportunities: React.FC = () => {
  const [opportunityProjects, setOpportunityProjects] = useState<Project[]>([]);
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOpportunityProjects = async () => {
      try {
        setIsLoading(true);
        const projects = await projectApi.getAll();
        const opportunityProjects = projects.filter(p => p.status === ProjectStatus.Opportunity);
        setOpportunityProjects(opportunityProjects);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load opportunity projects');
        setIsLoading(false);
      }
    };

    loadOpportunityProjects();
  }, []);

  const toggleProjectExpansion = (projectId: number) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
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

      {opportunityProjects.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ 
            '& .MuiAlert-icon': { color: 'primary.main' } 
          }}
        >
          No opportunity projects found.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {opportunityProjects.map(project => (
            <Grid item xs={12} key={project.id}>
              <Accordion 
                expanded={expandedProjectId === project.id}
                onChange={() => toggleProjectExpansion(project.id)}
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
                        {project.name}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="body2" color="text.secondary">
                        {ProjectStatus[project.status]}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <OpportunityTrackingWidget project={project} />
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
