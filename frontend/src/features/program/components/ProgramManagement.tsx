import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Snackbar,
  TextField,
  IconButton,
  Divider,
  } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { Program } from '../types/types';
import { programService } from '../services/programService';
import { ProgramList } from './ProgramList';
import { ProgramForm, ProgramFormData } from './ProgramForm';
import { ProgramDeleteDialog } from './ProgramDeleteDialog';

export interface ProgramManagementProps {
  className?: string;
}

export const ProgramManagement: React.FC<ProgramManagementProps> = ({ className }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await programService.getAllPrograms();
      setPrograms(data);
    } catch (err: any) {
      console.error('Error fetching programs:', err);
      setError(err.message || 'Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleCreateProgram = async (formData: ProgramFormData) => {
    try {
      setError(null);
      const newProgram = await programService.createProgram({
        ...formData,
        createdBy: 'Current User', // In a real app, get from auth context
        tenantId: 1 // In a real app, get from tenant context
      });
      
      setPrograms(prev => [...prev, newProgram]);
      setSuccessMessage('Program created successfully');
      setCreateDialogOpen(false);
    } catch (err: any) {
      console.error('Error creating program:', err);
      setError(err.message || 'Failed to create program');
      throw err; // Re-throw to let the form handle it
    }
  };

  const handleUpdateProgram = async (formData: ProgramFormData) => {
    if (!selectedProgram) return;
    
    try {
      setError(null);
      const updatedProgram = await programService.updateProgram(selectedProgram.id, {
        ...selectedProgram,
        ...formData,
        lastModifiedBy: 'Current User'
      });
      
      setPrograms(prev => prev.map(p => p.id === selectedProgram.id ? updatedProgram : p));
      setSuccessMessage('Program updated successfully');
      setSelectedProgram(null);
    } catch (err: any) {
      console.error('Error updating program:', err);
      setError(err.message || 'Failed to update program');
      throw err; // Re-throw to let the form handle it
    }
  };

  const handleDeleteClick = (programId: number) => {
    const program = programs.find(p => p.id === programId);
    if (program) {
      setDeletingProgram(program);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProgram) return;

    setDeleteLoading(true);
    try {
      setError(null);
      await programService.deleteProgram(deletingProgram.id);
      setPrograms(prev => prev.filter(p => p.id !== deletingProgram.id));
      setSuccessMessage('Program deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingProgram(null);
    } catch (err: any) {
      console.error('Error deleting program:', err);
      setError(err.message || 'Failed to delete program');
      setDeleteDialogOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingProgram(null);
  };

  const handleEditProgram = (program: Program) => {
    setSelectedProgram(program);
  };

  const handleViewProgram = (program: Program) => {
    // Navigate to program details page
    console.log('View program:', program);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleCloseEditDialog = () => {
    setSelectedProgram(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredPrograms = programs.filter(program =>
    program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box className={className} sx={{ mt: '64px', p: 3 }}>
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          p: 3
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1a237e'
            }}
          >
            Program Management
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            Create Program
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Search */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search programs"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              endAdornment: (
                <IconButton size="small">
                  <Search />
                </IconButton>
              ),
              sx: {
                borderRadius: 2,
                backgroundColor: 'background.paper'
              }
            }}
            sx={{
              width: 300
            }}
          />
        </Box>

        {/* Programs List */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography>Loading programs...</Typography>
          </Box>
        ) : (
          <ProgramList
            programs={filteredPrograms}
            onProgramDeleted={handleDeleteClick}
            onEditProgram={handleEditProgram}
            onViewProgram={handleViewProgram}
            canEdit={true}
            canDelete={true}
          />
        )}

        {/* Create Dialog */}
        <ProgramForm
          open={createDialogOpen}
          onClose={handleCloseCreateDialog}
          onSubmit={handleCreateProgram}
          mode="create"
          error={error}
          loading={loading}
        />

        {/* Edit Dialog */}
        {selectedProgram && (
          <ProgramForm
            open={!!selectedProgram}
            program={selectedProgram}
            onClose={handleCloseEditDialog}
            onSubmit={handleUpdateProgram}
            mode="edit"
            error={error}
            loading={loading}
          />
        )}

        {/* Delete Dialog */}
        {deletingProgram && (
          <ProgramDeleteDialog
            open={deleteDialogOpen}
            programName={deletingProgram.name}
            loading={deleteLoading}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        )}

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage(null)}
          message={successMessage}
        />

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ProgramManagement;
