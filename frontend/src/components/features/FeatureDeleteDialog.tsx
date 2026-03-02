import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { Feature } from '../../types/Feature';

interface FeatureDeleteDialogProps {
  open: boolean;
  feature: Feature | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const FeatureDeleteDialog: React.FC<FeatureDeleteDialogProps> = ({
  open,
  feature,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Error deleting feature:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          <span>Confirm Delete</span>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete the feature <strong>"{feature?.name}"</strong>?
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          This action cannot be undone. If this feature is associated with any subscription plans,
          the deletion may fail.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeatureDeleteDialog;
