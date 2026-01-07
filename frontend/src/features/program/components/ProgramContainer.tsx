import React, { useState, useCallback } from 'react';
import { Box, Typography, Button, Snackbar, Alert, Divider } from '@mui/material';
import { Add } from '@mui/icons-material';
import { Program } from '../types/types';
import { usePrograms } from '../hooks/usePrograms';
import { ProgramFormData, validateProgramForm, ValidationErrors } from '../validation/programValidation';
import {
  formatDate,
  getProgramStatus,
  getStatusConfig,
  filterPrograms,
  toDateInputFormat
} from '../utils/programUtils';

// Import dumb components
import { ProgramCard } from './ProgramCard';
import { ProgramListView } from './ProgramListView';
import { ProgramSearchBar } from './ProgramSearchBar';
import { ProgramFormDialog } from './ProgramFormDialog';
import { ProgramDeleteDialog } from './ProgramDeleteDialog';
import { ProgramEmptyState } from './ProgramEmptyState';

interface ProgramContainerProps {
  className?: string;
}

/**
 * SMART CONTAINER - All logic here
 * Orchestrates dumb components and manages state
 */
export const ProgramContainer: React.FC<ProgramContainerProps> = ({ className }) => {
  // Hooks
  const { programs, loading, error: apiError, createProgram, updateProgram, deleteProgram } = usePrograms();

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  // Form State
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<ProgramFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formLoading, setFormLoading] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Computed values
  const filteredPrograms = filterPrograms(programs, searchTerm);
  const hasPrograms = programs.length > 0;

  // Form Handlers
  const openCreateDialog = useCallback(() => {
    setFormMode('create');
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: ''
    });
    setValidationErrors({});
    setOperationError(null);
    setFormDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((program: Program) => {
    setFormMode('edit');
    setEditingProgram(program);
    setFormData({
      name: program.name,
      description: program.description ?? '',
      startDate: toDateInputFormat(program.startDate),
      endDate: toDateInputFormat(program.endDate)
    });
    setValidationErrors({});
    setOperationError(null);
    setFormDialogOpen(true);
  }, []);

  const closeFormDialog = useCallback(() => {
    setFormDialogOpen(false);
    setEditingProgram(null);
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: ''
    });
    setValidationErrors({});
    setOperationError(null);
  }, []);

  const handleFieldChange = useCallback((field: keyof ProgramFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [validationErrors]);

  const handleFormSubmit = useCallback(async () => {
    // Validate form
    const errors = validateProgramForm(formData);
    if (errors) {
      setValidationErrors(errors);
      return;
    }

    setFormLoading(true);
    setOperationError(null);

    try {
      if (formMode === 'create') {
        await createProgram({
          ...formData,
          createdBy: 'Current User', // TODO: Get from auth context
          tenantId: 1 // TODO: Get from tenant context
        });
        setSuccessMessage('Program created successfully');
      } else if (formMode === 'edit' && editingProgram) {
        await updateProgram(editingProgram.id, {
          ...editingProgram,
          ...formData,
          lastModifiedBy: 'Current User' // TODO: Get from auth context
        });
        setSuccessMessage('Program updated successfully');
      }
      closeFormDialog();
    } catch (err: any) {
      setOperationError(err.message || 'Failed to save program');
    } finally {
      setFormLoading(false);
    }
  }, [formData, formMode, editingProgram, createProgram, updateProgram, closeFormDialog]);

  // Delete Handlers
  const openDeleteDialog = useCallback((program: Program) => {
    setDeletingProgram(program);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeletingProgram(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingProgram) return;

    setDeleteLoading(true);
    setOperationError(null);

    try {
      await deleteProgram(deletingProgram.id);
      setSuccessMessage('Program deleted successfully');
      closeDeleteDialog();
    } catch (err: any) {
      setOperationError(err.message || 'Failed to delete program');
      closeDeleteDialog();
    } finally {
      setDeleteLoading(false);
    }
  }, [deletingProgram, deleteProgram, closeDeleteDialog]);

  // View handler
  const handleViewProgram = useCallback((program: Program) => {
    // TODO: Navigate to program details page
    console.log('View program:', program);
  }, []);

  // Render program card with logic
  const renderProgram = useCallback((program: Program) => {
    const status = getProgramStatus(program.startDate, program.endDate);
    const statusConfig = getStatusConfig(status);

    return (
      <ProgramCard
        key={program.id}
        program={program}
        statusLabel={statusConfig.label}
        statusColor={statusConfig.color}
        formattedStartDate={formatDate(program.startDate)}
        formattedEndDate={formatDate(program.endDate)}
        onEdit={() => openEditDialog(program)}
        onDelete={() => openDeleteDialog(program)}
        onView={() => handleViewProgram(program)}
        canEdit={true}
        canDelete={true}
      />
    );
  }, [openEditDialog, openDeleteDialog, handleViewProgram]);

  // Loading state
  if (loading && programs.length === 0) {
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
          <Typography>Loading programs...</Typography>
        </Box>
      </Box>
    );
  }

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
            onClick={openCreateDialog}
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

        {/* Search Bar */}
        {hasPrograms && (
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <ProgramSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              disabled={loading}
            />
          </Box>
        )}

        {/* Content */}
        {!hasPrograms ? (
          <ProgramEmptyState
            message="No programs found. Create your first program to get started."
            showCreateButton={true}
            onCreateClick={openCreateDialog}
          />
        ) : filteredPrograms.length === 0 ? (
          <ProgramEmptyState
            message={`No programs match "${searchTerm}"`}
            showCreateButton={false}
          />
        ) : (
          <ProgramListView
            programs={filteredPrograms}
            emptyMessage="No programs found"
            renderProgram={renderProgram}
          />
        )}

        {/* Form Dialog */}
        <ProgramFormDialog
          open={formDialogOpen}
          title={formMode === 'create' ? 'Create New Program' : 'Edit Program'}
          formData={formData}
          validationErrors={validationErrors}
          error={operationError}
          loading={formLoading}
          submitButtonText={formMode === 'create' ? 'Create Program' : 'Update Program'}
          onClose={closeFormDialog}
          onSubmit={handleFormSubmit}
          onFieldChange={handleFieldChange}
        />

        {/* Delete Dialog */}
        {deletingProgram && (
          <ProgramDeleteDialog
            open={deleteDialogOpen}
            programName={deletingProgram.name}
            loading={deleteLoading}
            onConfirm={handleDeleteConfirm}
            onCancel={closeDeleteDialog}
          />
        )}

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={!!operationError || !!apiError}
          autoHideDuration={6000}
          onClose={() => setOperationError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setOperationError(null)} severity="error" sx={{ width: '100%' }}>
            {operationError || apiError}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ProgramContainer;
