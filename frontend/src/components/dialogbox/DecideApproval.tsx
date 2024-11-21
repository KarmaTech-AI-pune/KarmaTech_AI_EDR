import React, { useState } from 'react';
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
  SelectChangeEvent,
  FormHelperText
} from '@mui/material';
import { HistoryLoggingService } from '../../services/historyLoggingService';
import { opportunityApi } from '../../dummyapi/opportunityApi';
import { WorkflowStatus } from '../../dummyapi/database/dummyopportunityTracking';

interface DecideApprovalProps {
  open: boolean;
  onClose: () => void;
  opportunityId: number;
  currentUser: string;
  onSubmit?: () => void;
}

type DecisionType = 'approve' | 'reject' | 'revise';
type ApprovalLevelType = 'final' | 'conditional';

const DecideApproval: React.FC<DecideApprovalProps> = ({ 
  open, 
  onClose, 
  opportunityId,
  currentUser,
  onSubmit 
}) => {
  const [decision, setDecision] = useState<DecisionType | ''>('');
  const [approvalLevel, setApprovalLevel] = useState<ApprovalLevelType | ''>('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDecisionChange = (event: SelectChangeEvent) => {
    setDecision(event.target.value as DecisionType);
    setError(null);
  };

  const handleApprovalLevelChange = (event: SelectChangeEvent) => {
    setApprovalLevel(event.target.value as ApprovalLevelType);
    setError(null);
  };

  const handleCommentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComments(event.target.value);
    setError(null);
  };

  const handleCancel = () => {
    setDecision('');
    setApprovalLevel('');
    setComments('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!decision) {
      setError('Please select a decision');
      return;
    }

    if (decision === 'approve' && !approvalLevel) {
      setError('Please select an approval level');
      return;
    }

    if (!comments.trim()) {
      setError('Please provide comments for your decision');
      return;
    }

    try {
      const opportunity = await opportunityApi.getById(opportunityId);
      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      let newWorkflowStatus: WorkflowStatus;
      let newStatus: string;

      switch (decision) {
        case 'approve':
          newWorkflowStatus = WorkflowStatus.Approved;
          newStatus = 'Approved';
          break;
        case 'reject':
          newWorkflowStatus = WorkflowStatus.Initial;
          newStatus = 'Approval Rejected';
          break;
        case 'revise':
          newWorkflowStatus = WorkflowStatus.ApprovalChanges;
          newStatus = 'Approval Changes Required';
          break;
        default:
          throw new Error('Invalid decision');
      }

      const updatedOpportunity = {
        ...opportunity,
        workflowStatus: newWorkflowStatus,
        status: newStatus,
        approvalComments: comments,
        approvalLevel: decision === 'approve' ? approvalLevel : undefined
      };

      await opportunityApi.update(updatedOpportunity);

      // Log the approval decision
      if (decision === 'approve' || decision === 'reject') {
        const mappedDecision = decision === 'approve' ? 'approved' : 'rejected';
        await HistoryLoggingService.logApprovalDecision(
          opportunityId,
          mappedDecision,
          currentUser,
          `${approvalLevel === 'conditional' ? 'Conditional approval' : 'Final approval'}. ${comments}`
        );
      } else if (decision === 'revise') {
        await HistoryLoggingService.logCustomEvent(
          opportunityId,
          'Approval Changes Requested',
          currentUser,
          comments
        );
      }

      // Log status change
      await HistoryLoggingService.logStatusChange(
        opportunityId,
        opportunity.status,
        newStatus,
        currentUser
      );

      // Reset form and close dialog
      setDecision('');
      setApprovalLevel('');
      setComments('');
      setError(null);
      
      if (onSubmit) {
        onSubmit();
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to submit approval decision:', err);
      setError(err.message || 'Failed to submit approval decision');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Decide Approval</DialogTitle>
      <DialogContent>
        <FormControl 
          fullWidth 
          margin="normal"
          error={!!error && !decision}
        >
          <InputLabel>Decision</InputLabel>
          <Select
            label="Decision"
            value={decision}
            onChange={handleDecisionChange}
          >
            <MenuItem value="approve">Approve</MenuItem>
            <MenuItem value="reject">Reject</MenuItem>
            <MenuItem value="revise">Request Changes</MenuItem>
          </Select>
          {error && !decision && <FormHelperText>Please select a decision</FormHelperText>}
        </FormControl>

        {decision === 'approve' && (
          <FormControl 
            fullWidth 
            margin="normal"
            error={!!error && !approvalLevel}
          >
            <InputLabel>Approval Level</InputLabel>
            <Select
              label="Approval Level"
              value={approvalLevel}
              onChange={handleApprovalLevelChange}
            >
              <MenuItem value="final">Final Approval</MenuItem>
              <MenuItem value="conditional">Conditional Approval</MenuItem>
            </Select>
            {error && !approvalLevel && <FormHelperText>Please select an approval level</FormHelperText>}
          </FormControl>
        )}

        <TextField
          margin="normal"
          label="Comments"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          placeholder="Enter your approval decision comments"
          value={comments}
          onChange={handleCommentsChange}
          error={!!error && !comments.trim()}
          helperText={error && !comments.trim() ? 'Comments are required' : error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSubmit}
          disabled={!decision || (decision === 'approve' && !approvalLevel) || !comments.trim()}
        >
          Submit Decision
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DecideApproval;
