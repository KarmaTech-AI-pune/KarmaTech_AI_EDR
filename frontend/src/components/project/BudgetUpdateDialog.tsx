/**
 * BudgetUpdateDialog Component
 * 
 * Modal dialog for updating project budget fields.
 * Features:
 * - Form fields for EstimatedProjectCost and EstimatedProjectFee
 * - Optional reason field with character limit validation
 * - Proper form validation and error display
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

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
  CircularProgress,
  Typography,
  InputAdornment,
} from '@mui/material';
import { projectBudgetApi } from '../../services/projectBudgetApi';
import { UpdateProjectBudgetRequest } from '../../types/projectBudget';

interface Project {
  projectId: number;
  projectName: string;
  estimatedProjectCost: number;
  estimatedProjectFee: number;
  currency?: string;
}

interface BudgetUpdateDialogProps {
  open: boolean;
  project: Project;
  onClose: () => void;
  onUpdate: () => void;
}

export const BudgetUpdateDialog: React.FC<BudgetUpdateDialogProps> = ({
  open,
  project,
  onClose,
  onUpdate,
}) => {
  const [estimatedProjectCost, setEstimatedProjectCost] = useState<string>('');
  const [estimatedProjectFee, setEstimatedProjectFee] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    cost?: string;
    fee?: string;
    reason?: string;
  }>({});

  const maxReasonLength = 500;
  const currency = project.currency || 'USD';

  // Initialize form with current project values
  useEffect(() => {
    if (open) {
      setEstimatedProjectCost(project.estimatedProjectCost.toString());
      setEstimatedProjectFee(project.estimatedProjectFee.toString());
      setReason('');
      setError(null);
      setSuccess(false);
      setValidationErrors({});
    }
  }, [open, project]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: { cost?: string; fee?: string; reason?: string } = {};

    // Parse values
    const costValue = parseFloat(estimatedProjectCost);
    const feeValue = parseFloat(estimatedProjectFee);

    // Validate cost
    if (estimatedProjectCost.trim() === '') {
      errors.cost = 'Cost is required';
    } else if (isNaN(costValue)) {
      errors.cost = 'Cost must be a valid number';
    } else if (costValue < 0) {
      errors.cost = 'Cost cannot be negative';
    }

    // Validate fee
    if (estimatedProjectFee.trim() === '') {
      errors.fee = 'Fee is required';
    } else if (isNaN(feeValue)) {
      errors.fee = 'Fee must be a valid number';
    } else if (feeValue < 0) {
      errors.fee = 'Fee cannot be negative';
    }

    // Validate reason length
    if (reason.length > maxReasonLength) {
      errors.reason = `Reason cannot exceed ${maxReasonLength} characters`;
    }

    // Check if at least one value has changed
    if (
      !errors.cost &&
      !errors.fee &&
      costValue === project.estimatedProjectCost &&
      feeValue === project.estimatedProjectFee
    ) {
      errors.cost = 'At least one budget field must be changed';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle dialog close
  const handleClose = React.useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  // Handle success auto-close
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success) {
      timer = setTimeout(() => {
        onUpdate();
        handleClose();
      }, 1500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, onUpdate, handleClose]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const costValue = parseFloat(estimatedProjectCost);
      const feeValue = parseFloat(estimatedProjectFee);

      const request: UpdateProjectBudgetRequest = {
        ...(costValue !== project.estimatedProjectCost && { estimatedProjectCost: costValue }),
        ...(feeValue !== project.estimatedProjectFee && { estimatedProjectFee: feeValue }),
        ...(reason.trim() && { reason: reason.trim() }),
      };

      await projectBudgetApi.updateBudget(project.projectId, request);

      setSuccess(true);
    } catch (err) {
      console.error('Error updating budget:', err);
      setError(err instanceof Error ? err.message : 'Failed to update budget');
    } finally {
      setLoading(false);
    }
  };

  // Handle cost change
  const handleCostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEstimatedProjectCost(event.target.value);
    if (validationErrors.cost) {
      setValidationErrors({ ...validationErrors, cost: undefined });
    }
  };

  // Handle fee change
  const handleFeeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEstimatedProjectFee(event.target.value);
    if (validationErrors.fee) {
      setValidationErrors({ ...validationErrors, fee: undefined });
    }
  };

  // Handle reason change
  const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReason(event.target.value);
    if (validationErrors.reason) {
      setValidationErrors({ ...validationErrors, reason: undefined });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Project Budget</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Project Info */}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Project: <strong>{project.projectName}</strong>
          </Typography>

          {/* Success Message */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Budget updated successfully!
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Estimated Project Cost */}
          <TextField
            fullWidth
            label="Estimated Project Cost"
            type="number"
            value={estimatedProjectCost}
            onChange={handleCostChange}
            error={!!validationErrors.cost}
            helperText={validationErrors.cost || `Current: ${currency} ${project.estimatedProjectCost.toLocaleString()}`}
            disabled={loading || success}
            sx={{ mb: 2, mt: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
            }}
            inputProps={{
              step: '0.01',
              min: '0',
            }}
          />

          {/* Estimated Project Fee */}
          <TextField
            fullWidth
            label="Estimated Project Fee"
            type="number"
            value={estimatedProjectFee}
            onChange={handleFeeChange}
            error={!!validationErrors.fee}
            helperText={validationErrors.fee || `Current: ${currency} ${project.estimatedProjectFee.toLocaleString()}`}
            disabled={loading || success}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
            }}
            inputProps={{
              step: '0.01',
              min: '0',
            }}
          />

          {/* Reason (Optional) */}
          <TextField
            fullWidth
            label="Reason for Change (Optional)"
            multiline
            rows={3}
            value={reason}
            onChange={handleReasonChange}
            error={!!validationErrors.reason}
            helperText={
              validationErrors.reason ||
              `${reason.length}/${maxReasonLength} characters. Provide context for this budget change.`
            }
            disabled={loading || success}
            sx={{ mb: 1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading || success}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || success}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Updating...' : 'Update Budget'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetUpdateDialog;
