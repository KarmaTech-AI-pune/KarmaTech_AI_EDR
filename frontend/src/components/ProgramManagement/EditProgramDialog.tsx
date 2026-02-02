import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { programApi } from '../../services/api/programApi';
import { Program, ProgramFormDto } from '../../types/program';

// Zod validation schema (same as create)
const editProgramSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable()
}).refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

type EditProgramFormData = z.infer<typeof editProgramSchema>;

interface EditProgramDialogProps {
  open: boolean;
  program: Program;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProgramDialog: React.FC<EditProgramDialogProps> = ({
  open,
  program,
  onClose,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm<EditProgramFormData>({
    resolver: zodResolver(editProgramSchema),
    defaultValues: {
      name: program.name || '',
      description: program.description || '',
      startDate: formatDateForInput(program.startDate),
      endDate: formatDateForInput(program.endDate)
    }
  });

  // Reset form when program changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        name: program.name || '',
        description: program.description || '',
        startDate: formatDateForInput(program.startDate),
        endDate: formatDateForInput(program.endDate)
      });
      setApiError(null);
      setHasUnsavedChanges(false);
    }
  }, [program, reset, open]);

  // Watch for changes to track unsaved changes
  useEffect(() => {
    const subscription = watch(() => {
      setHasUnsavedChanges(isDirty);
    });
    return () => subscription.unsubscribe();
  }, [watch, isDirty]);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }
    reset();
    setApiError(null);
    setHasUnsavedChanges(false);
    onClose();
  };

  const onSubmit = async (data: EditProgramFormData) => {
    try {
      setIsSubmitting(true);
      setApiError(null);

      const programDto: ProgramFormDto = {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate || null
      };

      await programApi.update(program.id, programDto);

      // Reset form and close dialog
      reset();
      setHasUnsavedChanges(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to update program:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to update program. Please try again.';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          // Handle validation errors
          const errors = Object.values(error.response.data.errors).flat();
          errorMessage = errors.join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2
          }
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>Edit Program</DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ pt: 2 }}>
          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Name Field */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Program Name"
                  required
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={isSubmitting}
                  autoFocus
                />
              )}
            />

            {/* Description Field */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  required
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  disabled={isSubmitting}
                />
              )}
            />

            {/* Start Date Field */}
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ''}
                  label="Start Date"
                  type="date"
                  required
                  fullWidth
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message}
                  disabled={isSubmitting}
                  slotProps={{
                    inputLabel: {
                      shrink: true
                    }
                  }}
                />
              )}
            />

            {/* End Date Field */}
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ''}
                  label="End Date (optional)"
                  type="date"
                  fullWidth
                  error={!!errors.endDate}
                  helperText={errors.endDate?.message}
                  disabled={isSubmitting}
                  slotProps={{
                    inputLabel: {
                      shrink: true
                    }
                  }}
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default EditProgramDialog;
