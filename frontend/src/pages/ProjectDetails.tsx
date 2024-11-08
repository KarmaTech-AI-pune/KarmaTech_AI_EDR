import { Box, Typography, Paper, Button, Grid, Chip, LinearProgress, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useContext, useState, useEffect } from 'react';
import { projectManagementAppContext } from '../App';
import { WBSChart } from "../components/WBSChart";
import { ProjectStatus, OpportunityTracking } from '../types';
import { opportunityApi } from '../services/api';

export const ProjectDetails = () => {
  const context = useContext(projectManagementAppContext);
  const project = context?.selectedProject;
  const [opportunityTracking, setOpportunityTracking] = useState<OpportunityTracking | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpportunityTracking = async () => {
      if (project?.id) {
        try {
          const data = await opportunityApi.getByProjectId(project.id);
          // Take the first opportunity tracking record if multiple exist
          setOpportunityTracking(data[0] || null);
          setApiError(null);
        } catch (error: any) {
          console.error('Failed to fetch opportunity tracking data:', error);
          
          // More detailed error handling
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            setApiError(`API Error: ${error.response.status} - ${error.response.data || 'No additional information'}`);
          } else if (error.request) {
            // The request was made but no response was received
            setApiError('No response received from the server');
          } else {
            // Something happened in setting up the request that triggered an Error
            setApiError('Error setting up the request: ' + error.message);
          }
        }
      }
    };

    if (project?.status === ProjectStatus.Opportunity) {
      fetchOpportunityTracking();
    }
  }, [project]);

  const handleBack = () => {
    if (context?.setScreenState) {
      context.setScreenState("Projects");
    }
  };

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No project selected</Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Opportunity: return 'warning';
      case ProjectStatus['In Progress']: return 'primary';
      case ProjectStatus.Completed: return 'success';
      case ProjectStatus['Decision Pending']: return 'info';
      case ProjectStatus['Bid Rejected']: return 'error';
      case ProjectStatus['Cancelled']: return 'error';
      case ProjectStatus['Bid Submitted']: return 'warning';
      case ProjectStatus['Bid Accepted']: return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Projects
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" gutterBottom>
              {project.name}
            </Typography>
            <Chip 
              label={ProjectStatus[project.status]}
              color={getStatusColor(project.status)}
            />
          </Grid>

          {/* API Error Alert */}
          {apiError && (
            <Grid item xs={12}>
              <Alert severity="error">
                {apiError}
              </Alert>
            </Grid>
          )}

          {/* Status-specific alerts */}
          {project.status === ProjectStatus.Opportunity && (
            <Grid item xs={12}>
              <Alert severity="info">
                This project is currently in the Opportunity Tracking phase.
                {!opportunityTracking && ' No opportunity tracking details available.'}
              </Alert>
            </Grid>
          )}

          {project.status === ProjectStatus['Decision Pending'] && (
            <Grid item xs={12}>
              <Alert severity="warning">
                This project is currently pending decision.
              </Alert>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Client Information
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Client Name: {project.clientName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sector: {project.clientSector}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Estimated Cost: {project.currency} {project.estimatedCost.toLocaleString()}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Created At: {formatDate(project.createdAt)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Timeline
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start Date: {formatDate(project.startDate)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              End Date: {formatDate(project.endDate)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Contract Type: {project.contractType}
            </Typography>
          </Grid>

          {project.progress !== undefined && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Progress
              </Typography>
              <Box sx={{ width: '100%', mb: 1 }}>
                <LinearProgress variant="determinate" value={project.progress} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {project.progress}% Complete
              </Typography>
            </Grid>
          )}

          {opportunityTracking && project.status === ProjectStatus.Opportunity && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'rgba(255, 171, 0, 0.1)' }}>
                <Typography variant="h6" gutterBottom>
                  Detailed Opportunity Tracking
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" color="text.secondary">
                      Stage: {opportunityTracking.stage}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Strategic Ranking: {opportunityTracking.strategicRanking}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Bid Manager: {opportunityTracking.bidManager}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Contact Person: {opportunityTracking.contactPersonAtClient || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" color="text.secondary">
                      Bid Fees: {opportunityTracking.bidFees ? `${project.currency} ${opportunityTracking.bidFees.toLocaleString()}` : 'Not specified'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Chance of Project Happening: {opportunityTracking.percentageChanceOfProjectHappening}%
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Likely Competition: {opportunityTracking.likelyCompetition || 'Not specified'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};
