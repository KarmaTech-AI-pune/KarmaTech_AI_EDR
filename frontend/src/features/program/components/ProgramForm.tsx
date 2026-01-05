import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Alert
} from '@mui/material';
import { Program } from '../types/types';

export interface ProgramFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface ProgramFormProps {
  open: boolean;
  program?: Program | null;
  onClose: () => void;
  onSubmit: (data: ProgramFormData) => Promise<void>;
  mode: 'create' | 'edit';
  error?: string | null;
  loading?: boolean;
}

export const ProgramForm: React.FC<ProgramFormProps> = ({
  open,
  program,
  onClose,
  onSubmit,
  mode,
  error = null,
  loading = false
}) => {
  const [formData, setFormData] = useState<ProgramFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<ProgramFormData>>({});

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && program) {
        setFormData({
          name: program.name,
          description: program.description ?? '',
          startDate: program.startDate.split('T')[0], // Convert to yyyy-mm-dd format
          endDate: program.endDate.split('T')[0] // Convert to yyyy-mm-dd format
        });
      } else {
        // Reset form for create mode
        setFormData({
          name: '',
          description: '',
          startDate: '',
          endDate: ''
        });
      }
      setFormErrors({});
    }
  }, [open, mode, program]);

  const validateForm = (): boolean => {
    const errors: Partial<ProgramFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Program name is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate >= endDate) {
        errors.endDate = 'End date must be after start date';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof ProgramFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error is handled by the parent component
      console.error('Form submission error:', error);
    }
  };

  const handleClose = () => {
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Create New Program' : 'Edit Program'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Program Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleInputChange('description')}
                error={!!formErrors.description}
                helperText={formErrors.description}
                multiline
                rows={4}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange('startDate')}
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
                disabled={loading}
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange('endDate')}
                error={!!formErrors.endDate}
                helperText={formErrors.endDate}
                disabled={loading}
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Program' : 'Update Program'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgramForm;
