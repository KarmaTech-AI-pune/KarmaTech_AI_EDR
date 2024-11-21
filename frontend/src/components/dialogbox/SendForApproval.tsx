/*import React, { useState } from 'react';
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
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { HistoryLoggingService } from '../../services/historyLoggingService';

interface SendForApprovalProps {
  open: boolean;
  onClose: () => void;
  opportunityId: number;
  currentUser: string;
  onSubmit?: () => void;
}

const SendForApproval: React.FC<SendForApprovalProps> = ({ 
  open, 
  onClose, 
  opportunityId,
  currentUser,
  onSubmit 
}) => {
  const [approver, setApprover] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');

  const handleApproverChange = (event: SelectChangeEvent) => {
    setApprover(event.target.value);
  };

  const handlePriorityChange = (event: SelectChangeEvent) => {
    setPriority(event.target.value);
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      await HistoryLoggingService.logSentOpportunityForApproval(
        opportunityId,
        currentUser,
        approver,
        notes
      );
      
      if (onSubmit) {
        onSubmit();
      }
      onClose();
    } catch (error) {
      console.error('Failed to send for approval:', error);
      // Here you might want to show an error message to the user
    }
  };

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
            value={approver}
            onChange={handleApproverChange}
          >
            <MenuItem value="">Select Approver</MenuItem>
            <MenuItem value="Project Manager">Project Manager</MenuItem>
            <MenuItem value="Business Development Manager">Business Development Manager</MenuItem>
            <MenuItem value="Director">Director</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Priority</InputLabel>
          <Select
            label="Priority"
            value={priority}
            onChange={handlePriorityChange}
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
          value={notes}
          onChange={handleNotesChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSubmit}
          disabled={!approver} // Disable if no approver is selected
        >
          Send for Approval
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendForApproval;*/
