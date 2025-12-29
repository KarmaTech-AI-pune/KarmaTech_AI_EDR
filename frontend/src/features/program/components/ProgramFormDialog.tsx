import React from 'react';
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
import { ProgramFormData, ValidationErrors } from '../validation/programValidation';

interface ProgramFormDialogProps {
  open: boolean;
  title: string;
  formData: ProgramFormData;
  validationErrors: ValidationErrors;
  error: string | null;
  loading: boolean;
  submitButtonText: string;
  onClose: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof ProgramFormData, value: string) => void;
}

/**
 * DUMB COMPONENT - Pure presentation, no logic
 * Controlled form dialog - all state managed by parent
 */
export const ProgramFormDialog: React.FC<ProgramFormDialogProps> = ({
  open,
  title,
  formData,
  validationErrors,
  error,
  loading,
  submitButtonText,
  onClose,
  onSubmit,
  onFieldChange
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      
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
                onChange={(e) => onFieldChange('name', e.target.value)}
                error={!!validationErrors.name}
                helperText={validationErrors.name}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => onFieldChange('description', e.target.value)}
                error={!!validationErrors.description}
                helperText={validationErrors.description}
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
                onChange={(e) => onFieldChange('startDate', e.target.value)}
                error={!!validationErrors.startDate}
                helperText={validationErrors.startDate}
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
                onChange={(e) => onFieldChange('endDate', e.target.value)}
                error={!!validationErrors.endDate}
                helperText={validationErrors.endDate}
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
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
