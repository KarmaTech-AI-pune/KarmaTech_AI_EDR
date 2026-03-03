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
  currentTotalPercentage: number;
}

export const AddPaymentScheduleDialog: React.FC<AddPaymentScheduleDialogProps> = ({
  open,
  onClose,
  onAdd,
  totalAmountINR,
  currentTotalPercentage,
}) => {
  const [description, setDescription] = useState('');
  const [percentage, setPercentage] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>('');
  const [errors, setErrors] = useState<{ description?: string; percentage?: string; dueDate?: string }>({});

  // Calculate remaining percentage allowed
  const remainingPercentage = Math.max(0, 100 - currentTotalPercentage);

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
    } else {
      // Only check total percentage if basic percentage validation passes
      const newTotalPercentage = currentTotalPercentage + percentage;
      if (newTotalPercentage > 100) {
        newErrors.percentage = `Total percentage cannot exceed 100%. Current total: ${currentTotalPercentage}%, Remaining: ${remainingPercentage}%`;
      }
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
            helperText={
              errors.percentage || 
              `Enter percentage (Max remaining: ${remainingPercentage}%)`
            }
            fullWidth
            required
            inputProps={{
              min: 0,
              max: remainingPercentage,
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

          {/* Current Total Percentage Info */}
          <Box
            sx={{
              p: 2,
              backgroundColor: remainingPercentage === 0 ? '#fee2e2' : '#f0f9ff',
              borderRadius: 1,
              border: '1px solid',
              borderColor: remainingPercentage === 0 ? '#fca5a5' : '#bfdbfe',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Current Total:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {currentTotalPercentage}%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Remaining:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600, 
                  color: remainingPercentage === 0 ? '#dc2626' : '#059669' 
                }}
              >
                {remainingPercentage}%
              </Typography>
            </Box>
          </Box>

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
          disabled={remainingPercentage === 0}
          sx={{
            textTransform: 'none',
            backgroundColor: '#3b82f6',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
            '&:disabled': {
              backgroundColor: '#e5e7eb',
              color: '#9ca3af',
            },
          }}
        >
          Add Payment Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};
