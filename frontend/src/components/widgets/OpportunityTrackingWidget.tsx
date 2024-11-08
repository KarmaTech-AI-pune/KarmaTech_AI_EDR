import { useState } from 'react';
import { Typography, Paper, Grid, Alert, Button, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Project, ProjectStatus, OpportunityTracking } from '../../types';

interface OpportunityTrackingWidgetProps {
  project: Project;
  opportunityTracking: OpportunityTracking | null;
  apiError: string | null;
}

const OpportunityTrackingWidget: React.FC<OpportunityTrackingWidgetProps> = ({ 
  project, 
  opportunityTracking, 
  apiError 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCreateOpportunity = () => {
    // TODO: Implement create opportunity functionality
    console.log('Create opportunity clicked');
  };

  // If it's not an opportunity status project, show collapsible widget
  if (project.status !== ProjectStatus.Opportunity) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Grid container spacing={1} alignItems="center" onClick={() => setIsExpanded(!isExpanded)}>
          <Grid item xs>
            <Typography variant="h6">
              Opportunity Tracking
            </Typography>
          </Grid>
          <Grid item>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </Grid>
        </Grid>
        
        <Collapse in={isExpanded}>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Opportunity data not found
          </Typography>
        </Collapse>
      </Paper>
    );
  }

  // Show API error if any
  if (apiError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {apiError}
      </Alert>
    );
  }

  // If no opportunity tracking exists for an opportunity status project
  if (!opportunityTracking) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          No opportunity tracking details available.
        </Alert>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleCreateOpportunity}
        >
          Create Opportunity
        </Button>
      </Paper>
    );
  }

  // Display opportunity tracking details
  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2, backgroundColor: 'rgba(255, 171, 0, 0.1)' }}>
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
  );
};

export default OpportunityTrackingWidget;
