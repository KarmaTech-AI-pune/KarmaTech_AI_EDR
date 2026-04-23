import React, { useState } from 'react';
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
import { programApi } from '../../services/programApi';
import { ProgramFormDto } from '../../types/program';

// Zod validation schema
const createProgramSchema = z.object({
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

type CreateProgramFormData = z.infer<typeof createProgramSchema>;

interface CreateProgramDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProgramDialog: React.FC<CreateProgramDialogProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm<CreateProgramFormData>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: ''
    }
  });

  // Watch for changes to track unsaved changes
  React.useEffect(() => {
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

  const onSubmit = async (data: CreateProgramFormData) => {
    try {
      setIsSubmitting(true);
      setApiError(null);

      const programDto: ProgramFormDto = {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate || null
      };

      await programApi.create(programDto);

      // Reset form and close dialog
      reset();
      setHasUnsavedChanges(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to create program:', error);
      setApiError(
        error.response?.data?.message || 
        error.message || 
        'Failed to create program. Please try again.'
      );
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
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>Create New Program</DialogTitle>

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
            {isSubmitting ? 'Creating...' : 'Create Program'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CreateProgramDialog;
