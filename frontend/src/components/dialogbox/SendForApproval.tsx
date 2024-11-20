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

interface SendForApprovalProps {
  open: boolean;
  onClose: () => void;
}

const SendForApproval: React.FC<SendForApprovalProps> = ({ open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Send for Approval</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Approver</InputLabel>
          <Select
            label="Approver"
            defaultValue=""
          >
            <MenuItem value="">Select Approver</MenuItem>
            <MenuItem value="manager1">Project Manager</MenuItem>
            <MenuItem value="manager2">Business Development Manager</MenuItem>
            <MenuItem value="director">Director</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Priority</InputLabel>
          <Select
            label="Priority"
            defaultValue="medium"
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>

        <TextField
          margin="normal"
          label="Additional Notes"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          placeholder="Enter any additional notes"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" color="primary">
          Send for Approval
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendForApproval;
