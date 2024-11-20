import React, { useEffect, useState, useContext } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { Project, OpportunityTracking } from '../types';
import { projectManagementAppContext } from '../App';
import { opportunityApi } from '../dummyapi/opportunityApi';
import ProjectInfoWidget from '../components/widgets/ProjectInfoWidget';
import OpportunityTrackingWidget from '../components/widgets/OpportunityTrackingWidget';
import GoNoGoWidget from '../components/widgets/GoNoGoWidget';
import DecisionWidget from '../components/widgets/DecisionWidget';

export const ProjectDetails: React.FC = () => {
  const [opportunity, setOpportunity] = useState<OpportunityTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const context = useContext(projectManagementAppContext);

  useEffect(() => {
    const fetchOpportunityData = async () => {
      if (!context?.selectedProject?.id) return;

      try {
        setIsLoading(true);
        setError(null);
        const opportunities = await opportunityApi.getByProjectId(context.selectedProject.id);
        if (opportunities && opportunities.length > 0) {
          setOpportunity(opportunities[0]);
        }
      } catch (err) {
        console.error('Error fetching opportunity data:', err);
        setError('Failed to load opportunity data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunityData();
  }, [context?.selectedProject]);

  const handleStatusUpdate = (updatedProject: Project) => {
    if (context?.setSelectedProject) {
      context.setSelectedProject(updatedProject);
    }
  };

  if (!context?.selectedProject) {
    return (
      <Container>
        <Alert severity="warning">No project selected</Alert>
      </Container>
    );
  }

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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Project Details
      </Typography>
      {/*
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ProjectInfoWidget project={context.selectedProject} />
        </Grid>

        <Grid item xs={12} md={6}>
          <OpportunityTrackingWidget project={context.selectedProject} />
        </Grid>

        <Grid item xs={12} md={6}>
          <GoNoGoWidget 
            projectId={context.selectedProject.id} 
            project={context.selectedProject}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <DecisionWidget 
            project={context.selectedProject}
            onStatusUpdate={handleStatusUpdate}
          />
        </Grid>
      </Grid> 
    */}
    </Container>
  );
};

export default ProjectDetails;
