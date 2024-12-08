import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

interface DeleteWBSDialogProps {
  open: boolean;
  childCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteWBSDialog: React.FC<DeleteWBSDialogProps> = ({
  open,
  childCount,
  onCancel,
  onConfirm
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">
        Confirm Deletion
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          This action will delete this row and {childCount} child {childCount === 1 ? 'row' : 'rows'}. Are you sure you want to proceed?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteWBSDialog;
