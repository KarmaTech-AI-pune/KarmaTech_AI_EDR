import { useState, useContext, useEffect } from 'react';
import { Typography, Paper, Grid, Alert, Button, Collapse, Chip } from '@mui/material';
import { ExpandMore, ExpandLess, TrendingUp, AssignmentTurnedIn, MonetizationOn } from '@mui/icons-material';
import { Project, ProjectStatus, OpportunityTracking } from '../../types';
import OpportunityForm from '../forms/OpportunityForm';
import { opportunityApi } from '../../dummyapi/api';
import { projectManagementAppContext } from '../../App';

interface OpportunityTrackingWidgetProps {
  project: Project;
}

const OpportunityTrackingWidget: React.FC<OpportunityTrackingWidgetProps> = ({ project }) => {
  const context = useContext(projectManagementAppContext);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [opportunityTracking, setOpportunityTracking] = useState<OpportunityTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchOpportunityTracking = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const trackings = await opportunityApi.getByProjectId(project.id);
      // Get the most recent tracking if any exists
      setOpportunityTracking(trackings.length > 0 ? trackings[0] : null);
    } catch (error: any) {
      console.error('Error fetching opportunity tracking:', error);
      setApiError(error.message || 'Failed to fetch opportunity tracking');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunityTracking();
  }, [project.id]);

  const handleCreateOpportunity = () => {
    setIsFormOpen(true);
    setFormError(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setFormError(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (!context?.user?.name) {
        throw new Error('User not authenticated');
      }

      const submissionData = {
        ...data,
        createdBy: context.user.name,
        createdAt: new Date().toISOString(),
        lastModifiedBy: context.user.name,
        lastModifiedAt: new Date().toISOString()
      };

      const newOpportunity = await opportunityApi.create(submissionData);
      setOpportunityTracking(newOpportunity);
      setIsFormOpen(false);
      setFormError(null);
      
      // Refresh the data after successful submission
      await fetchOpportunityTracking();
    } catch (error: any) {
      console.error('Error creating opportunity:', error);
      setFormError(error.message || 'Failed to create opportunity');
    }
  };

  const getStatusColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case 'a': return 'success';
      case 'b': return 'info';
      case 'c': return 'warning';
      case 'd': return 'error';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography>Loading opportunity tracking...</Typography>
      </Paper>
    );
  }

  // If it's not an opportunity status project, show collapsible widget
  if (project.status !== ProjectStatus.Opportunity) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mt: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
        <Grid container spacing={1} alignItems="center" onClick={() => setIsExpanded(!isExpanded)}>
          <Grid item xs>
            <Typography variant="h6" color="text.primary">
              Opportunity Tracking
            </Typography>
          </Grid>
          <Grid item>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </Grid>
        </Grid>
        
        <Collapse in={isExpanded}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Opportunity tracking is only available for projects in Opportunity status
          </Typography>
        </Collapse>
      </Paper>
    );
  }

  // Show API error if any
  

  // If no opportunity tracking exists for an opportunity status project
  if (!opportunityTracking) {
    return (
      <>
        <Paper variant="outlined" sx={{ p: 3, mt: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2, 
              '& .MuiAlert-icon': { color: 'primary.main' } 
            }}
          >
            No opportunity tracking details available.
          </Alert>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<TrendingUp />}
            onClick={handleCreateOpportunity}
            sx={{ 
              textTransform: 'none', 
              borderRadius: 2 
            }}
          >
            Create Opportunity
          </Button>
        </Paper>
        <OpportunityForm
          open={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          project={project}
          error={formError}
        />
      </>
    );
  }
  if (apiError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {apiError}
      </Alert>
    );
  }

  // Display opportunity tracking details
  return (
    <>
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 3, 
          mt: 2, 
          backgroundColor: 'rgba(0, 105, 255, 0.04)', 
          borderColor: 'primary.light' 
        }}
      >
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Opportunity Details
            </Typography>
          </Grid>
          <Grid item>
            <Chip 
              label={`Stage ${opportunityTracking.stage}`}
              color={getStatusColor(opportunityTracking.stage)}
              icon={<AssignmentTurnedIn />}
              variant="outlined"
            />
          </Grid>
        </Grid>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Project Insights
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.primary">
                  Strategic Ranking: {opportunityTracking.strategicRanking}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.primary">
                  Bid Manager: {opportunityTracking.bidManager || 'Not assigned'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.primary">
                  Contact Person: {opportunityTracking.contactPersonAtClient || 'Not specified'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Financial Projection
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography 
                  variant="body2" 
                  color="text.primary" 
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <MonetizationOn sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
                  Bid Fees: {opportunityTracking.bidFees ? `${project.currency} ${opportunityTracking.bidFees.toLocaleString()}` : 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.primary">
                  Chance of Project: {opportunityTracking.percentageChanceOfProjectHappening}%
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.primary">
                  Chance of Success: {opportunityTracking.percentageChanceOfNJSSuccess}%
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.primary">
                  Likely Competition: {opportunityTracking.likelyCompetition || 'Not specified'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <OpportunityForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        project={project}
        error={formError}
      />
    </>
  );
};

export default OpportunityTrackingWidget;
