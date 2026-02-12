/**
 * AddPaymentScheduleDialog Component
 * Dialog form for adding new payment schedule entries
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { PaymentMilestone } from '../types/cashflow';

interface AddPaymentScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (milestone: Omit<PaymentMilestone, 'id'>) => void;
  totalAmountINR: number;
}

export const AddPaymentScheduleDialog: React.FC<AddPaymentScheduleDialogProps> = ({
  open,
  onClose,
  onAdd,
  totalAmountINR,
}) => {
  const [description, setDescription] = useState('');
  const [percentage, setPercentage] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>('');
  const [errors, setErrors] = useState<{ description?: string; percentage?: string; dueDate?: string }>({});

  const calculateAmount = (percent: number) => {
    return (totalAmountINR * percent) / 100;
  };

  const handleSubmit = () => {
    // Validation
    const newErrors: { description?: string; percentage?: string; dueDate?: string } = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (percentage <= 0 || percentage > 100) {
      newErrors.percentage = 'Percentage must be between 1 and 100';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create new milestone
    const newMilestone: Omit<PaymentMilestone, 'id'> = {
      description: description.trim(),
      percentage,
      amountINR: calculateAmount(percentage),
      dueDate: dueDate || undefined,
    };

    onAdd(newMilestone);
    handleClose();
  };

  const handleClose = () => {
    setDescription('');
    setPercentage(0);
    setDueDate('');
    setErrors({});
    onClose();
  };

  const handlePercentageChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setPercentage(numValue);
      setErrors((prev) => ({ ...prev, percentage: undefined }));
    } else if (value === '') {
      setPercentage(0);
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
          borderRadius: 2,
        },
      }}
    >
      {/* Dialog Title */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Add Payment Schedule
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ pt: 3, pb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Description Field */}
          <TextField
            label="Description"
            placeholder="e.g., Inception Report"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            required
            autoFocus
            sx={{ mt: 2 }}
          />

          {/* Percentage Field */}
          <TextField
            label="Percentage"
            type="number"
            placeholder="e.g., 10"
            value={percentage || ''}
            onChange={(e) => handlePercentageChange(e.target.value)}
            error={!!errors.percentage}
            helperText={errors.percentage || 'Enter percentage (1-100)'}
            fullWidth
            required
            inputProps={{
              min: 0,
              max: 100,
              step: 0.1,
            }}
            InputProps={{
              endAdornment: <Typography sx={{ color: 'text.secondary' }}>%</Typography>,
            }}
          />

          {/* Due Date Field */}
          <TextField
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              setErrors((prev) => ({ ...prev, dueDate: undefined }));
            }}
            error={!!errors.dueDate}
            helperText={errors.dueDate || 'Select payment due date (optional)'}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* Calculated Amount Display */}
          <Box
            sx={{
              p: 2,
              backgroundColor: '#f9fafb',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Calculated Amount:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(calculateAmount(percentage))}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button onClick={handleClose} variant="outlined" sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            textTransform: 'none',
            backgroundColor: '#3b82f6',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
          }}
        >
          Add Payment Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};
