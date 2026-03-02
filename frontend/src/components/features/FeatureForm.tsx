import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Feature, FeatureFormData } from '../../types/Feature';

interface FeatureFormProps {
  open: boolean;
  feature: Feature | null;
  onClose: () => void;
  onSubmit: (data: FeatureFormData) => Promise<void>;
}

// Validation schema using Zod
const featureSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  isActive: z.boolean(),
});

const FeatureForm: React.FC<FeatureFormProps> = ({ open, feature, onClose, onSubmit }) => {
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  // Reset form when feature changes or dialog opens
  useEffect(() => {
    if (open) {
      if (feature) {
        // Edit mode - populate with existing data
        reset({
          name: feature.name,
          description: feature.description,
          isActive: feature.isActive,
        });
      } else {
        // Create mode - reset to defaults
        reset({
          name: '',
          description: '',
          isActive: true,
        });
      }
      setSubmitError(null);
    }
  }, [open, feature, reset]);

  const handleFormSubmit = async (data: FeatureFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save feature');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{feature ? 'Edit Feature' : 'Add New Feature'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box display="flex" flexDirection="column" gap={2}>
            {/* Name Field */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Feature Name"
                  required
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
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
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

            {/* Is Active Checkbox */}
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Is Active"
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FeatureForm;
