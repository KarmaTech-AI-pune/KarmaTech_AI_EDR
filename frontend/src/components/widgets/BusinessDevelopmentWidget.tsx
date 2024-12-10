import { OpportunityTracking } from '../../models';
import { Card, CardContent, Typography, Grid, Chip, Divider, Box } from '@mui/material';
import { getWorkflowStatusById } from '../../dummyapi/database/dummyOpporunityWorkflow';
import { getUserById } from '../../dummyapi/database/dummyusers';

interface BusinessDevelopmentWidgetProps {
  opportunity: OpportunityTracking;
}

export const BusinessDevelopmentWidget = ({ opportunity }: BusinessDevelopmentWidgetProps) => {
  const formatNumber = (value: number | undefined, currency?: string) => {
    if (value === undefined || value === null) return 'Not specified';
    return currency ? `${currency} ${value.toLocaleString()}` : value.toLocaleString();
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'bid under preparation':
        return 'info';
      case 'bid submitted':
        return 'primary';
      case 'bid rejected':
        return 'error';
      case 'bid accepted':
        return 'success';
      default:
        return 'default';
    }
  };

  const getWorkflowColor = (workflowId: number) => {
    const status = getWorkflowStatusById(workflowId)?.status;
    switch (status) {
      case "Initial":
        return 'default';
      case "Sent for Review":
        return 'info';
      case "Review Changes":
        return 'warning';
      case "Sent for Approval":
        return 'primary';
      case "Approval Changes":
        return 'warning';
      case "Approved":
        return 'success';
      default:
        return 'default';
    }
  };

  const getManagerName = (managerId: number | undefined) => {
    if (!managerId) return 'Not assigned';
    const manager = getUserById(managerId);
    return manager ? manager.name : 'Unknown';
  };

  return (
    <Card sx={{ mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" color="primary" gutterBottom>
                Client Information
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                {opportunity.client || 'Not specified'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sector: {opportunity.clientSector || 'Not specified'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contact: {opportunity.contactPersonAtClient || 'Not specified'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Chip 
                label={`Status: ${opportunity.status || 'Not specified'}`}
                color={getStatusColor(opportunity.status)}
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip 
                label={`Workflow: ${getWorkflowStatusById(opportunity.workflowId)?.status || 'Not specified'}`}
                color={getWorkflowColor(opportunity.workflowId)}
                sx={{ mb: 1 }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary" gutterBottom>
              Project Overview
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Operation: {opportunity.operation || 'Not specified'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Stage: {opportunity.stage || 'Not specified'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Strategic Ranking: {opportunity.strategicRanking || 'Not specified'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary" gutterBottom>
              Management
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Bid Manager: {getManagerName(opportunity.bidManagerId)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Review Manager: {getManagerName(opportunity.reviewManagerId)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Approval Manager: {getManagerName(opportunity.approvalManagerId)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary" gutterBottom>
              Success Metrics
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                Project Success Rate: {opportunity.percentageChanceOfProjectHappening !== undefined ? 
                  <Chip 
                    label={`${opportunity.percentageChanceOfProjectHappening}%`}
                    color={opportunity.percentageChanceOfProjectHappening > 50 ? 'success' : 'warning'}
                    size="small"
                  /> : 'Not specified'}
              </Typography>
              <Typography variant="body1">
                NJS Success Rate: {opportunity.percentageChanceOfNJSSuccess !== undefined ? 
                  <Chip 
                    label={`${opportunity.percentageChanceOfNJSSuccess}%`}
                    color={opportunity.percentageChanceOfNJSSuccess > 50 ? 'success' : 'warning'}
                    size="small"
                  /> : 'Not specified'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary" gutterBottom>
              Financial Details
            </Typography>
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              <Typography variant="body1" gutterBottom>
                Bid Fees: <strong>{formatNumber(opportunity.bidFees, opportunity.currency)}</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                EMD: <strong>{formatNumber(opportunity.emd, opportunity.currency)}</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                Form of EMD: {opportunity.formOfEMD || 'Not specified'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Gross Revenue: <strong>{formatNumber(opportunity.grossRevenue, opportunity.currency)}</strong>
              </Typography>
              <Typography variant="body1">
                Net NJS Revenue: <strong>{formatNumber(opportunity.netNJSRevenue, opportunity.currency)}</strong>
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary" gutterBottom>
              Project Details
            </Typography>
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              <Typography variant="body1" gutterBottom>
                Capital Value: <strong>{formatNumber(opportunity.capitalValue, opportunity.currency)}</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                Duration: {opportunity.durationOfProject ? `${opportunity.durationOfProject} months` : 'Not specified'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Contract Type: {opportunity.contractType || 'Not specified'}
              </Typography>
              <Typography variant="body1">
                Funding Stream: {opportunity.fundingStream || 'Not specified'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="primary" gutterBottom>
              Additional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Competition & Criteria
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Likely Competition:</strong> {opportunity.likelyCompetition || 'Not specified'}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Qualifying Criteria:</strong> {opportunity.probableQualifyingCriteria || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Comments & Notes
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Follow-up Comments:</strong> {opportunity.followUpComments || 'Not specified'}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Notes:</strong> {opportunity.notes || 'Not specified'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
