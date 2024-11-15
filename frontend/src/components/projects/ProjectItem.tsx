import { ListItem, ListItemText, Box, LinearProgress, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import {Button} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { ProjectItemProps, ProjectFormData, ProjectStatus } from '../../types';
import { useState, useContext } from 'react';
import { projectApi } from '../../dummyapi/api';
import { ProjectForm } from './ProjectForm';
import { projectManagementAppContext } from '../../App';

export const ProjectItem: React.FC<ProjectItemProps> = ({ project, onProjectDeleted, onProjectUpdated }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const context = useContext(projectManagementAppContext);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
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
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSubmit = async (formData: ProjectFormData) => {
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
          bgcolor: '#e0e0e0', 
          mb: 1, 
          borderRadius: 1,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: '#d0d0d0'
          }
        }}
        onClick={handleProjectClick}
      >
        <ListItemText 
          primary={project.name}
          secondary={
            <>
            
              <Typography component="span" variant="body2">
                Client: {project.clientName}
              </Typography>
              <br />
              <Typography component="span" variant="body2">
                Status: {ProjectStatus[project.status]}
              </Typography>
              {project.estimatedCost > 0 && (
                <>
                  <br />
                  <Typography component="span" variant="body2">
                    Estimated Cost: {project.currency} {project.estimatedCost.toLocaleString()}
                  </Typography>
                </>
              )}
    
              
               <LinearProgress variant="determinate" value={project.progress} />   
                      
            </>
          }
        />  
        <Button onClick={handleEditClick}><Edit/></Button>
        <Button sx={{color: 'red'}} onClick={handleDeleteClick}><Delete /></Button>
      
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
          <ProjectForm 
            project={project}
            onSubmit={handleEditSubmit}
            onCancel={handleEditClose}
          />
        </DialogContent>
      </Dialog> 
    </>
  );
};
