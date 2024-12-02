import { ListItem,Typography, Dialog, DialogTitle, DialogContent, DialogActions, Box, Grid } from '@mui/material';
import { Button } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { ProjectItemProps, ProjectFormData, UserWithRole } from '../../types';
import { useState, useContext, useEffect } from 'react';
import { projectApi } from '../../dummyapi/api';
import { ProjectInitForm } from '../forms/ProjectInitForm';
import { projectManagementAppContext } from '../../App';
import { authApi } from '../../dummyapi/authApi';
import { PermissionType } from '../../dummyapi/database/dummyRoles';

export const ProjectItem: React.FC<ProjectItemProps> = ({ project, onProjectDeleted, onProjectUpdated }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [canEditProject, setCanEditProject] = useState(false);
  const [canDeleteProject, setCanDeleteProject] = useState(false);
  const context = useContext(projectManagementAppContext);

  useEffect(() => {
    const checkUserPermissions = async () => {
      const user = await authApi.getCurrentUser();
      
      if (!user) {
        setCurrentUser(null);
        setCanEditProject(false);
        setCanDeleteProject(false);
        return;
      }

      setCurrentUser(user);

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
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canEditProject) {
      setEditDialogOpen(true);
    }
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSubmit = async (formData: ProjectFormData) => {
    if (!canEditProject) return;
    try {
      const updatedProject = { ...formData, id: project.id };
      await projectApi.update(project.id, updatedProject);
      setEditDialogOpen(false);
      if (onProjectUpdated) {
        onProjectUpdated();
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleProjectClick = () => {
    if (context?.setScreenState && context?.setSelectedProject) {
      context.setSelectedProject(project);
      context.setScreenState("Project Details");
    }
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
                <strong>Client:</strong> {project.clientName} ({project.typeOfClient})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Office:</strong> {project.office} ({project.region})
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Type:</strong> {project.typeOfJob} | <strong>Sector:</strong> {project.sector}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Cost:</strong> {project.currency} {project.estimatedCost.toLocaleString()} ({project.feeType})
              </Typography>
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
          />
        </DialogContent>
      </Dialog> 
    </>
  );
};
