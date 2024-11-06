import { ListItem, ListItemText, Box, LinearProgress, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import {Button} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { ProjectItemProps, ProjectFormData } from '../../types';
import { useState } from 'react';
import { projectApi } from '../../services/api';
import { ProjectForm } from './ProjectForm';

export const ProjectItem: React.FC<ProjectItemProps> = ({ project, onProjectDeleted, onProjectUpdated }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleDeleteClick = () => {
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

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSubmit = async (formData: ProjectFormData) => {
    try {
      await projectApi.update(project.id, { ...formData, id: project.id });
      setEditDialogOpen(false);
      if (onProjectUpdated) {
        onProjectUpdated();
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  return (
    <>
      <ListItem sx={{ bgcolor: '#e0e0e0', mb: 1, borderRadius: 1 }}>
        <ListItemText 
          primary={project.name}
          secondary={`Status: ${project.status}`}
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
