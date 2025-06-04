import {
  ListItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  Button,
  Chip
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { BDChips } from '../common/BDChips';
import { OpportunityTrackingWorkflow } from '../common/OpportunityTrackingWorkflow';
import { getWorkflowStatusById } from '../../dummyapi/database/dummyOpporunityWorkflow';
import { OpportunityItemProps } from '../../types';
import { useState, useContext, useEffect } from 'react';
import { opportunityApi } from '../../dummyapi/opportunityApi';
import { OpportunityTracking } from '../../models';
import { OpportunityForm } from '../forms/OpportunityForm';
import { projectManagementAppContext } from '../../App';
import { authApi } from '../../dummyapi/authApi';
import { PermissionType } from '../../models';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export const OpportunityItem: React.FC<OpportunityItemProps> = ({
  opportunity,
  onOpportunityDeleted,
  onOpportunityUpdated
}) => {
  // Add state to track the current opportunity
  const [currentOpportunity, setCurrentOpportunity] = useState<OpportunityTracking>(opportunity);
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [canEditOpportunity, setCanEditOpportunity] = useState(false);
  const [canDeleteOpportunity, setCanDeleteOpportunity] = useState(false);
  const context = useContext(projectManagementAppContext);
  const navigation = useAppNavigation();

  // Update current opportunity when the prop changes
  useEffect(() => {
    setCurrentOpportunity(opportunity);
  }, [opportunity]);

  useEffect(() => {
    const checkUserPermissions = async () => {
      const user = await authApi.getCurrentUser();

      if (!user) {
        setCanEditOpportunity(false);
        setCanDeleteOpportunity(false);
        return;
      }

      if (user.roleDetails) {
        setCanEditOpportunity(
          user.roleDetails.permissions.includes(PermissionType.EDIT_BUSINESS_DEVELOPMENT)
        );
        setCanDeleteOpportunity(
          user.roleDetails.permissions.includes(PermissionType.DELETE_BUSINESS_DEVELOPMENT)
        );
      }
    };

    checkUserPermissions();
  }, []);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canDeleteOpportunity) {
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!canDeleteOpportunity) return;
    try {
      await opportunityApi.delete(opportunity.id);
      setDeleteDialogOpen(false);
      if (onOpportunityDeleted) {
        onOpportunityDeleted(opportunity.id.toString());
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canEditOpportunity) {
      setEditDialogOpen(true);
    }
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  // Enhanced handler for opportunity updates
  const handleOpportunityUpdate = async (updatedOpp?: OpportunityTracking) => {
    if (updatedOpp) {
      // Use the provided updated opportunity
      setCurrentOpportunity(updatedOpp);
      if (onOpportunityUpdated) {
        onOpportunityUpdated();
      }
    } else {
      // Fallback to fetching from API
      try {
        const fetchedOpportunity = await opportunityApi.getById(opportunity.id);
        console.log("fetched opportunity", fetchedOpportunity);
        setCurrentOpportunity(fetchedOpportunity);
        if (onOpportunityUpdated) {
          onOpportunityUpdated();
        }
      } catch (error) {
        console.error('Error updating opportunity:', error);
      }
    }
  };

  const handleEditSubmit = async (formData: Partial<OpportunityTracking>) => {
    if (!canEditOpportunity) return;
    try {
      const updatedOpportunity = { ...formData, id: opportunity.id };
      const result = await opportunityApi.update(opportunity.id, updatedOpportunity);
      setCurrentOpportunity(result);
      setEditDialogOpen(false);
      if (onOpportunityUpdated) {
        onOpportunityUpdated();
      }
    } catch (error) {
      console.error('Error updating opportunity:', error);
    }
  };

  const handleOpportunityClick = () => {
    navigation.navigateToBusinessDevelopmentDetails(currentOpportunity);
  };

  return (
    <>
      <ListItem
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 3,
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
            transform: 'translateX(4px)',
            boxShadow: 1
          }
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
            <Typography variant="h6" sx={{
              color: 'primary.main',
              fontWeight: 600
            }}>
              {currentOpportunity.workName || 'Unnamed Opportunity'}
            </Typography>

            <Box sx={{
              display: 'flex',
              gap: 1
            }}>
              {canEditOpportunity && (
                <Button
                  size="small"
                  onClick={handleEditClick}
                  sx={{
                    minWidth: 'auto',
                    p: 1,
                    color: 'primary.main'
                  }}
                >
                  <Edit />
                </Button>
              )}
              {canDeleteOpportunity && (
                <Button
                  size="small"
                  onClick={handleDeleteClick}
                  sx={{
                    minWidth: 'auto',
                    p: 1,
                    color: 'error.main'
                  }}
                >
                  <Delete />
                </Button>
              )}
            </Box>
          </Box>

          {/* Main Content */}
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Client:</strong> {currentOpportunity.client || 'Not specified'} ({currentOpportunity.clientSector || 'N/A'})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Operation:</strong> {currentOpportunity.operation || 'Not specified'}
                </Typography>

              </Box>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Stage:</strong> {currentOpportunity.stage || 'Not specified'} | <strong>Status:</strong> {currentOpportunity.status || 'Not specified'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Bid Fees:</strong> {currentOpportunity.currency} {currentOpportunity.bidFees?.toLocaleString() || 'Not specified'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Bid Number:</strong> {currentOpportunity.bidNumber || 'Not specified'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{
            mt: 1,
          }}>
              <Chip
                label={`Workflow: ${currentOpportunity.currentHistory
                    ? Array.isArray(currentOpportunity.currentHistory)
                      ? getWorkflowStatusById(currentOpportunity.currentHistory[0]?.statusId)?.status || 'Not specified'
                      : getWorkflowStatusById(currentOpportunity.currentHistory.statusId)?.status || 'Not specified'
                    : 'Not specified'
                  }`}
                color={
                  Array.isArray(currentOpportunity.currentHistory)
                    ? getWorkflowColor(currentOpportunity.currentHistory[0]?.statusId || 0)
                    : getWorkflowColor(currentOpportunity.currentHistory?.statusId || 0)
                }
                sx={{ mb: 1 }}
              />
            </Box>

          {/* Workflow Section */}
          <Box sx={{
            mt: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <BDChips opportunityId={currentOpportunity.id} />
            </Box>

            <Box>
              <OpportunityTrackingWorkflow
                opportunity={currentOpportunity}
                onOpportunityUpdated={handleOpportunityUpdate}
              />
            </Box>
          </Box>
        </Box>
      </ListItem>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
        Are you sure you want to delete opportunity "{currentOpportunity.workName}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <OpportunityForm
            onSubmit={handleEditSubmit}
            project={currentOpportunity}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
