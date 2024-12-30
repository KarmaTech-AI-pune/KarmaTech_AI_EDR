import { 
  ListItem, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Grid,
  Chip,
  Box,
  Button,
  Divider,
  Alert
} from '@mui/material';
import { 
  Edit, 
  Delete,
  Business,
  Timeline,
  AttachMoney,
  LocationOn,
  CalendarToday,
  Assessment,
  Person,
  WorkHistory,
} from '@mui/icons-material';
import { OpportunityTracking} from "../../models";
import { OpportunityItemProps} from '../../types';
import { useState, useContext} from 'react';
import { opportunityApi } from '../../dummyapi/opportunityApi';
import { OpportunityForm } from '../forms/OpportunityForm';
import { projectManagementAppContext } from '../../App';
import { getWorkflowStatusById } from '../../dummyapi/database/dummyOpporunityWorkflow';
import { OpportunityTrackingWorkflow } from '../common/OpportunityTrackingWorkflow';

export const OpportunityItem: React.FC<OpportunityItemProps> = ({ 
  opportunity, 
  onOpportunityDeleted, 
  onOpportunityUpdated 
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const context = useContext(projectManagementAppContext);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (context?.canDeleteOpportunity) {
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!context?.canDeleteOpportunity) return;
    try {
      await opportunityApi.delete(opportunity.id);
      setDeleteDialogOpen(false);
      if (onOpportunityDeleted) {
        onOpportunityDeleted(opportunity.id);
      }
    } catch (error: unknown) {
      console.error('Error deleting opportunity:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to delete opportunity');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (context?.canEditOpportunity) {
      setEditDialogOpen(true);
      setFormError(undefined);
    }
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setFormError(undefined);
  };

  const handleEditSubmit = async (formData: OpportunityTracking) => {
    if (!context?.canEditOpportunity) return;
    try {
      const updatedOpportunity = {
        ...formData,
        id: opportunity.id,
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: context?.currentUser?.name || 'Unknown'
      };
      
      await opportunityApi.update(updatedOpportunity);
      setEditDialogOpen(false);
      setFormError(undefined);
      
      if (onOpportunityUpdated) {
        onOpportunityUpdated();
      }
    } catch (error: unknown) {
      console.error('Error updating opportunity:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to update opportunity');
    }
  };

  const handleWorkflowUpdate = () => {
    if (onOpportunityUpdated) {
      onOpportunityUpdated();
    }
  };

  const handleOpportunityClick = () => {
    if (context?.setScreenState && context?.setSelectedProject) {
      context.setSelectedProject(opportunity);
      context.setScreenState("Business Development Details");
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case 'a': return 'success';
      case 'b': return 'info';
      case 'c': return 'warning';
      case 'd': return 'error';
      default: return 'default';
    }
  };

  const getStrategicRankingColor = (ranking: string) => {
    switch (ranking?.toLowerCase()) {
      case 'h': return 'success';
      case 'm': return 'warning';
      case 'l': return 'error';
      default: return 'default';
    }
  };

  const getWorkflowStatusColor = (workflowId: string) => {
    const status = getWorkflowStatusById(workflowId)?.status;
    switch (status) {
      case "Initial":
        return 'default';
      case "Sent for Review":
        return 'info';
      case "Review Changes":
        return 'warning';
      case "Sent for Approval":
        return 'info';
      case "Approval Changes":
        return 'warning';
      case "Approved":
        return 'success';
      default:
        return 'default';
    }
  };

  // Safely format number with fallback
  const formatNumber = (value: number | undefined, currency?: string) => {
    if (value === undefined || value === null) return 'Not specified';
    return currency ? `${currency} ${value.toLocaleString()}` : value.toLocaleString();
  };

  return (
    <>
      <ListItem 
        sx={{ 
          bgcolor: '#f5f5f5', 
          mb: 2, 
          borderRadius: 2,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: '#e8e8e8'
          },
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
        onClick={handleOpportunityClick}
      >
        <Box sx={{ width: '100%' }}>
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 2
          }}>
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                {opportunity.workName || 'Unnamed Opportunity'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip 
                  label={`Stage ${opportunity.stage || 'N/A'}`}
                  color={getStageColor(opportunity.stage)}
                  size="small"
                  icon={<Timeline />}
                />
                <Chip 
                  label={`Strategic Ranking: ${opportunity.strategicRanking || 'N/A'}`}
                  color={getStrategicRankingColor(opportunity.strategicRanking)}
                  size="small"
                  icon={<Assessment />}
                />
                <Chip 
                  label={getWorkflowStatusById(opportunity.workflowId)?.status || 'Unknown'}
                  color={getWorkflowStatusColor(opportunity.workflowId)}
                  size="small"
                  icon={<WorkHistory />}
                />
                <Chip 
                  label={opportunity.status || 'No Status'}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <OpportunityTrackingWorkflow 
                onOpportunityUpdated={handleWorkflowUpdate} 
                opportunity={opportunity} 
              />
              {context?.canEditOpportunity && (
                <Button 
                  onClick={handleEditClick}
                  size="small"
                  startIcon={<Edit />}
                >
                  Edit
                </Button>
              )}
              {context?.canDeleteOpportunity && (
                <Button 
                  onClick={handleDeleteClick}
                  size="small"
                  color="error"
                  startIcon={<Delete />}
                >
                  Delete
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Details Grid */}
          <Grid container spacing={2}>
            {/* Client Information */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Business sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" color="primary">
                  Client Information
                </Typography>
              </Box>
              <Typography variant="body2">
                <strong>Client Name:</strong> {opportunity.client|| 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>Client Sector:</strong> {opportunity.clientSector || 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>Contact Person:</strong> {opportunity.contactPersonAtClient || 'Not specified'}
              </Typography>
            </Grid>

            {/* Financial Details */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" color="primary">
                  Financial Details
                </Typography>
              </Box>
              <Typography variant="body2">
                <strong>Bid Fees:</strong> {formatNumber(opportunity.bidFees, opportunity.currency)}
              </Typography>
              <Typography variant="body2">
                <strong>EMD:</strong> {formatNumber(opportunity.emd, opportunity.currency)}
              </Typography>
            </Grid>

            {/* Project Details */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" color="primary">
                  Project Details
                </Typography>
              </Box>
              <Typography variant="body2">
                <strong>Operation:</strong> {opportunity.operation || 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>Work Name:</strong> {opportunity.workName || 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>Contract Type:</strong> {opportunity.contractType || 'Not specified'}
              </Typography>
            </Grid>

            {/* Timeline & Success Metrics */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" color="primary">
                  Timeline & Success Metrics
                </Typography>
              </Box>
              <Typography variant="body2">
                <strong>Likely Start Date:</strong> {opportunity.likelyStartDate ? new Date(opportunity.likelyStartDate).toLocaleDateString() : 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>Project Success:</strong> {opportunity.percentageChanceOfNJSSuccess !== undefined ? `${opportunity.percentageChanceOfNJSSuccess}%` : 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>Project Duration:</strong> {opportunity.durationOfProject ? `${opportunity.durationOfProject} months` : 'Not specified'}
              </Typography>
            </Grid>

            {/* Additional Details */}
            {(opportunity.likelyCompetition || opportunity.followUpComments) && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle2" color="primary">
                    Additional Information
                  </Typography>
                </Box>
                {opportunity.likelyCompetition && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Likely Competition:</strong> {opportunity.likelyCompetition}
                  </Typography>
                )}
                {opportunity.followUpComments && (
                  <Typography variant="body2">
                    <strong>Follow-up Comments:</strong> {opportunity.followUpComments}
                  </Typography>
                )}
              </Grid>
            )}
          </Grid>
        </Box>
      </ListItem>

      {/* Delete Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete opportunity "{opportunity.workName}"?
          </Typography>
          {formError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Form */}
      <OpportunityForm 
        open={editDialogOpen}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        project={opportunity}
        error={formError}
      />
    </>
  );
};
