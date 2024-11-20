import React from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

interface DecideApprovalProps {
  open: boolean;
  onClose: () => void;
}

const DecideApproval: React.FC<DecideApprovalProps> = ({ open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Decide Approval</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Decision</InputLabel>
          <Select
            label="Decision"
            defaultValue=""
          >
            <MenuItem value="approve">Approve</MenuItem>
            <MenuItem value="reject">Reject</MenuItem>
            <MenuItem value="revise">Request Changes</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Approval Level</InputLabel>
          <Select
            label="Approval Level"
            defaultValue=""
          >
            <MenuItem value="final">Final Approval</MenuItem>
            <MenuItem value="conditional">Conditional Approval</MenuItem>
          </Select>
        </FormControl>

        <TextField
          margin="normal"
          label="Comments"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          placeholder="Enter your approval decision comments"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" color="primary">
          Submit Decision
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DecideApproval;
