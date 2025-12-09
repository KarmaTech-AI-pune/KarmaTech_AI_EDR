import { ListItem, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Box, Grid } from '@mui/material';
import { Button } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { ProjectItemProps, ProjectFormData } from '../../types/index';
import { useState, useEffect } from 'react';
import { projectApi } from '../../services/projectApi';
import { ProjectInitForm } from '../forms/ProjectInitForm';
import { authApi } from '../../services/authApi';
import { getUsersByRole } from '../../services/userApi';
import { PermissionType } from '../../models';
import { AuthUser } from '../../models/userModel';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { BudgetHealthDisplay } from './budget/BudgetHealthIndicatorExample';

export const ProjectItem: React.FC<ProjectItemProps> = ({ project, onProjectDeleted, onProjectUpdated }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [canEditProject, setCanEditProject] = useState(false);
  const [canDeleteProject, setCanDeleteProject] = useState(false);
  const [approvalManagers, setApprovalManagers] = useState<{id: string, name: string}[]>([]);
  const [projectManagers, setProjectManagers] = useState<{id: string, name: string}[]>([]);
  const [seniorProjectManagers, setSeniorProjectManagers] = useState<{id: string, name: string}[]>([]);
  const navigation = useAppNavigation();

  useEffect(() => {
    const checkUserPermissions = async () => {
      const user = await authApi.getCurrentUser();

      if (!user) {
        setCanEditProject(false);
        setCanDeleteProject(false);
        return;
      }


      // Check if user has specific project permissions
      if (user.roleDetails) {
        setCanEditProject(
          user.roleDetails.permissions.includes(PermissionType.EDIT_PROJECT)
        );
        setCanDeleteProject(
          user.roleDetails.permissions.includes(PermissionType.DELETE_PROJECT)
        );
      }
    };

    checkUserPermissions();
  }, []);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canDeleteProject) {
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!canDeleteProject) return;
    try {
      await projectApi.delete(project.id);
      setDeleteDialogOpen(false);
      if (onProjectDeleted) {
        onProjectDeleted(project.id);
      }
    } catch (error: any) {
      console.error('Error deleting project:', error);
      // Close the dialog even if there's an error
      setDeleteDialogOpen(false);
      // Let the parent component handle the error
      if (onProjectDeleted) {
        onProjectDeleted(project.id);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const fetchManagers = async () => {
    // Helper function to convert users to unique manager objects and sort by name
    const getUniqueManagers = (users: AuthUser[]) => {
      // Create a Map with user ID as key to ensure uniqueness
      const uniqueManagersMap = new Map<string, { id: string; name: string }>();

      // Add each user to the map, overwriting any duplicates
      users.forEach(user => {
        // Ensure we have valid data
        if(user.name && user.id) {
          uniqueManagersMap.set(user.id, {id: user.id, name: user.name});
        }
      });

      // Convert to array and sort by name
      return Array.from(uniqueManagersMap.values())
        .sort((a, b) => a.name.localeCompare(b.name));
    };

    try {
      const projectManagerUsers = await getUsersByRole('Project Manager');
      const uniqueProjectManagers = getUniqueManagers(projectManagerUsers);
      setProjectManagers(uniqueProjectManagers);

      const seniorProjectManagerUsers = await getUsersByRole('Senior Project Manager');
      const uniqueSeniorProjectManagers = getUniqueManagers(seniorProjectManagerUsers);
      setSeniorProjectManagers(uniqueSeniorProjectManagers);

      // Fetch and set Regional Managers/Directors
      const regionalManagerUsers = await getUsersByRole('Regional Manager');
      const regionalDirectorUsers = await getUsersByRole('Regional Director');

      // Combine both arrays and get unique managers
      const allApproverUsers = [...regionalManagerUsers, ...regionalDirectorUsers];
      const uniqueApprovers = getUniqueManagers(allApproverUsers);

      setApprovalManagers(uniqueApprovers);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canEditProject) {
      // Load manager data before opening the dialog
      fetchManagers();
      setEditDialogOpen(true);
    }
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSubmit = async (formData: ProjectFormData & { budgetReason?: string }) => {
    if (!canEditProject) return;
    try {
      // Check if budget has changed
      const budgetChanged = 
        Number(formData.estimatedProjectCost) !== Number(project.estimatedProjectCost) ||
        Number(formData.estimatedProjectFee) !== Number(project.estimatedProjectFee);

      // Create a clean object with just the fields we need
      const updatedProject = {
        ...project, // Start with existing project data
        // Update with form data
        name: formData.name,
        clientName: formData.clientName,
        projectNo: formData.projectNo,
        typeOfClient: formData.typeOfClient,
        projectManagerId: formData.projectManagerId,
        seniorProjectManagerId: formData.seniorProjectManagerId,
        regionalManagerId: formData.regionalManagerId,
        office: formData.office,
        region: formData.region,
        typeOfJob: formData.typeOfJob,
        sector: formData.sector,
        feeType: formData.feeType,
        estimatedProjectCost: Number(formData.estimatedProjectCost),
        estimatedProjectFee: Number(formData.estimatedProjectFee || 0),
        percentage: Number(formData.percentage || 0),
        priority: formData.priority,
        currency: formData.currency,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        letterOfAcceptance: formData.letterOfAcceptance,
        details: formData.details
      };

      console.log('Sending update with data:', updatedProject);
      await projectApi.update(project.id, updatedProject, budgetChanged ? formData.budgetReason : undefined);
      setEditDialogOpen(false);
      if (onProjectUpdated) {
        onProjectUpdated();
      }
    } catch (error: any) {
      console.error('Error updating project:', error);
      // Close the dialog even if there's an error
      setEditDialogOpen(false);
      // Let the parent component handle the refresh
      if (onProjectUpdated) {
        onProjectUpdated();
      }
    }
  };

  const handleProjectClick = () => {
    navigation.navigateToProjectDetails(project);
  };

  return (
    <>
      <ListItem
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
            transform: 'translateX(4px)'
          }
        }}
        onClick={handleProjectClick}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>
            {project.name}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Client:</strong> {project.clientName} {project.typeOfClient ? `(${project.typeOfClient})` : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Office:</strong> {project.office} {project.region ? `(${project.region})` : ''}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Type:</strong> {project.typeOfJob} | <strong>Sector:</strong> {project.sector}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Cost:</strong> {project.currency} {project.estimatedProjectCost ? project.estimatedProjectCost.toLocaleString() : 'N/A'} {project.feeType ? `(${project.feeType})` : ''}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 1 }}>
                <BudgetHealthDisplay projectId={project.id} compact />
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{
          display: 'flex',
          gap: 1,
          ml: 2
        }}>
          {canEditProject && (
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
          {canDeleteProject && (
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
      </ListItem>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete project "{project.name}"?
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
          <ProjectInitForm
            project={project}
            onSubmit={handleEditSubmit}
            onCancel={handleEditClose}
            approvalManagers={approvalManagers}
            projectManagers={projectManagers}
            seniorProjectManagers={seniorProjectManagers}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
