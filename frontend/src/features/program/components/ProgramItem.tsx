import React, { useState } from 'react';
import {
  ListItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  Chip,
  Button
} from '@mui/material';
import { Edit, Delete, CalendarToday, Person, Info } from '@mui/icons-material';
import { Program } from '../types/types';
import { ProgramForm, ProgramFormData } from './ProgramForm';

export interface ProgramItemProps {
  program: Program;
  onProgramDeleted?: (programId: number) => void;
  onProgramUpdated?: () => void;
  onViewProgram?: (program: Program) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ProgramItem: React.FC<ProgramItemProps> = ({
  program,
  onProgramDeleted,
  onProgramUpdated,
  onViewProgram,
  canEdit = false,
  canDelete = false
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusChip = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return <Chip label="Not Started" color="default" size="small" />;
    } else if (now >= start && now <= end) {
      return <Chip label="Active" color="primary" size="small" />;
    } else {
      return <Chip label="Completed" color="success" size="small" />;
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canDelete) {
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!canDelete || !onProgramDeleted) return;
    try {
      await onProgramDeleted(program.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting program:', error);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canEdit) {
      setEditDialogOpen(true);
    }
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSubmit = async (formData: ProgramFormData) => {
    if (!canEdit || !onProgramUpdated) return;
    try {
      console.log('Updating program:', program.id, formData);
      setEditDialogOpen(false);
      onProgramUpdated();
    } catch (error) {
      console.error('Error updating program:', error);
      setEditDialogOpen(false);
    }
  };

  const handleProgramClick = () => {
    if (onViewProgram) {
      onViewProgram(program);
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
          p: 3,
          transition: 'all 0.2s ease-in-out',
          cursor: onViewProgram ? 'pointer' : 'default',
          '&:hover': onViewProgram ? {
            bgcolor: 'action.hover',
            transform: 'translateX(4px)'
          } : {}
        }}
        onClick={handleProgramClick}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h6" sx={{ color: 'primary.main', flexGrow: 1 }}>
              {program.name}
            </Typography>
            {getStatusChip(program.startDate, program.endDate)}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {program.description}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  <strong>Start:</strong> {formatDate(program.startDate)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  <strong>End:</strong> {formatDate(program.endDate)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <Person fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  <strong>Created by:</strong> {program.createdBy}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box display="flex" flexDirection="column" gap={1} ml={2}>
          {onViewProgram && (
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onViewProgram(program);
              }}
              startIcon={<Info />}
              variant="outlined"
            >
              Details
            </Button>
          )}
          {canEdit && (
            <Button
              size="small"
              onClick={handleEditClick}
              startIcon={<Edit />}
              color="primary"
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              size="small"
              onClick={handleDeleteClick}
              startIcon={<Delete />}
              color="error"
            >
              Delete
            </Button>
          )}
        </Box>
      </ListItem>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the program "{program.name}"?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <ProgramForm
        open={editDialogOpen}
        program={program}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        mode="edit"
      />
    </>
  );
};

export default ProgramItem;
