import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

interface ProgramDeleteDialogProps {
  open: boolean;
  programName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * DUMB COMPONENT - Pure presentation, no logic
 * Confirmation dialog for program deletion
 */
export const ProgramDeleteDialog: React.FC<ProgramDeleteDialogProps> = ({
  open,
  programName,
  loading,
  onConfirm,
  onCancel
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the program "<strong>{programName}</strong>"?
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
