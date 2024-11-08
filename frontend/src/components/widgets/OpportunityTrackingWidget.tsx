import { useState } from 'react';
import { Typography, Paper, Grid, Alert, Button, Collapse, Chip } from '@mui/material';
import { ExpandMore, ExpandLess, TrendingUp, AssignmentTurnedIn, MonetizationOn } from '@mui/icons-material';
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
    console.log('Create opportunity clicked');
  };

  const getStatusColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case 'initial': return 'default';
      case 'proposal': return 'primary';
      case 'negotiation': return 'secondary';
      case 'final': return 'success';
      default: return 'default';
    }
  };

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
            Opportunity data not found for this project
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
    );
  }

  // Display opportunity tracking details
  return (
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
            label={opportunityTracking.stage} 
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
                Likely Competition: {opportunityTracking.likelyCompetition || 'Not specified'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OpportunityTrackingWidget;
