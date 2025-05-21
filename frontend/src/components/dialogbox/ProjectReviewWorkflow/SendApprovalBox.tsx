import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  FormControl, 
  FormHelperText, 
  InputLabel, 
  MenuItem, 
  Select, 
  SelectChangeEvent, 
  TextField 
} from '@mui/material';
import React, { useState, useContext, useCallback } from 'react';
import { projectManagementAppContext } from '../../../App';
import { projectManagementAppContextType } from '../../../types';
import { TaskType } from '../../../types/wbs';

// Define workflow status enum for consistency
enum WorkflowStatus {
  INITIAL = "Initial",
  SENT_FOR_REVIEW = "Sent for Review",
  REVIEW_CHANGES = "Review Changes",
  SENT_FOR_APPROVAL = "Sent for Approval",
  APPROVAL_CHANGES = "Approval Changes",
  APPROVED = "Approved"
}

interface SendApprovalBoxProps {
  open: boolean;
  onClose: () => void;
  status?: string;
  projectId?: string;
  onSubmit?: (payload: any) => void;
  entityId?: number;
  entityType?: string;
  formType?: TaskType;
}

type DecisionType = 'approve' | 'reject';

const SendApprovalBox: React.FC<SendApprovalBoxProps> = ({
    open,
    onClose,
    status = WorkflowStatus.SENT_FOR_REVIEW,
    projectId,
    onSubmit,
    entityId,
    entityType = "Project",
    formType
}) => {
    const context = useContext(projectManagementAppContext) as projectManagementAppContextType;
    const [decision, setDecision] = useState<DecisionType | ''>('');
    const [comments, setComments] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Create a normalized status for comparison
    const normalizedStatus = status === WorkflowStatus.SENT_FOR_REVIEW 
      ? WorkflowStatus.SENT_FOR_REVIEW 
      : WorkflowStatus.SENT_FOR_APPROVAL;

    // Reset form on dialog open/close
    React.useEffect(() => {
      if (!open) {
        setDecision('');
        setComments('');
        setError(null);
      }
    }, [open]);

    const handleDecisionChange = useCallback((event: SelectChangeEvent) => {
      event.stopPropagation();
      setDecision(event.target.value as DecisionType);
      setError(null);
    }, []);

    const handleCommentsChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      setComments(event.target.value);
      setError(null);
    }, []);

    const handleCancel = useCallback((event: React.MouseEvent) => {
      event.stopPropagation();
      setDecision('');
      setComments('');
      setError(null);
      onClose();
    }, [onClose]);

    const handleDialogClick = useCallback((event: React.MouseEvent) => {
      event.stopPropagation();
    }, []);

    const validateForm = useCallback((): boolean => {
      if (!decision) {
        setError('Please select a decision');
        return false;
      }

      // For 'Sent for Review' status, comments are required only for rejection
      if (normalizedStatus === WorkflowStatus.SENT_FOR_REVIEW) {
        if (decision === 'reject' && !comments.trim()) {
          setError('Please provide comments for rejection');
          return false;
        }
      }
      // For all other statuses, comments are required for both approve and reject
      else if (!comments.trim()) {
        setError('Comments are required');
        return false;
      }

      return true;
    }, [decision, comments, normalizedStatus]);

    const handleSubmit = useCallback(async (event: React.MouseEvent) => {
      event.stopPropagation();
      
      if (!validateForm()) {
        return;
      }

      if (!context?.currentUser?.id) {
        setError('User information is missing');
        return;
      }

      // Create payload based on status and decision
      let payload = {
        statusId: 0,
        Action: '',
        comments: comments,
        AssignedBy: context.currentUser?.id || '',
        AssignedTo: '',
        entityId: entityId,
        entityType: entityType,
        formType: formType
      };

      if (normalizedStatus === WorkflowStatus.SENT_FOR_REVIEW) {
        if (decision === 'approve') {
          payload.statusId = 4;
          payload.Action = 'Approval';
          // For send for approval, assign to Regional Manager
          payload.AssignedTo = context.selectedProject && 'regionalManagerId' in context.selectedProject
            ? context.selectedProject.regionalManagerId || ''
            : '';
        } else { // reject
          payload.statusId = 3;
          payload.Action = 'Reject';
          // For rejection, assign back to Project Manager
          payload.AssignedTo = context.selectedProject && 'projectManagerId' in context.selectedProject
            ? context.selectedProject.projectManagerId || ''
            : '';
        }
      } else if (normalizedStatus === WorkflowStatus.SENT_FOR_APPROVAL) {
        if (decision === 'approve') {
          payload.statusId = 6;
          payload.Action = 'Approved';
          // For approval, we don't need to assign to anyone, but the backend expects a value
          payload.AssignedTo = context.currentUser?.id || '';
        } else { // reject
          payload.statusId = 5;
          payload.Action = 'Reject';
          // For rejection, assign back to SPM
          payload.AssignedTo = context.selectedProject && 'seniorProjectManagerId' in context.selectedProject
            ? context.selectedProject.seniorProjectManagerId || ''
            : '';
        }
      }

      // Validate the assignee
      if (!payload.AssignedTo) {
        if (payload.Action === 'Approval' && normalizedStatus === WorkflowStatus.SENT_FOR_REVIEW) {
          setError('No Regional Manager assigned to this project');
          return;
        } else if (payload.Action === 'Reject' && normalizedStatus === WorkflowStatus.SENT_FOR_REVIEW) {
          setError('No Project Manager assigned to this project');
          return;
        } else if (payload.Action === 'Reject' && normalizedStatus === WorkflowStatus.SENT_FOR_APPROVAL) {
          setError('No Senior Project Manager assigned to this project');
          return;
        }
      }

      if (onSubmit) {
        onSubmit(payload);
      }

      // Reset form and close dialog
      setDecision('');
      setComments('');
      setError(null);
      onClose();
    }, [
      context, 
      decision, 
      comments, 
      entityId, 
      entityType, 
      formType, 
      normalizedStatus, 
      onClose, 
      onSubmit, 
      validateForm
    ]);

    // Determine if comments are required based on status and decision
    const commentsRequired = normalizedStatus === WorkflowStatus.SENT_FOR_REVIEW
      ? decision === 'reject'
      : true;

    // Determine if submit button should be disabled
    const isSubmitDisabled = !decision || 
      (commentsRequired && !comments.trim());

    // Get dialog title based on status
    const dialogTitle = normalizedStatus === WorkflowStatus.SENT_FOR_REVIEW 
      ? 'Decide Review' 
      : 'Decide Approval';

    return (
      <Dialog
        open={open}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
        onClick={handleDialogClick}
        sx={{
          '& .MuiDialog-paper': {
            zIndex: 9999
          }
        }}
        slotProps={{
          backdrop: {
            onClick: (event) => {
              event.stopPropagation();
              handleCancel(event as React.MouseEvent);
            }
          }
        }}
      >
        <DialogTitle onClick={handleDialogClick}>{dialogTitle}</DialogTitle>
        <DialogContent onClick={handleDialogClick}>
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
              onClick={handleDialogClick}
            >
              <MenuItem value="approve" onClick={(e) => e.stopPropagation()}>Approve</MenuItem>
              <MenuItem value="reject" onClick={(e) => e.stopPropagation()}>Reject</MenuItem>
            </Select>
            {error && !decision && <FormHelperText>Please select a decision</FormHelperText>}
          </FormControl>

          {/* Show comments field always for SENT_FOR_APPROVAL or when decision is reject for SENT_FOR_REVIEW */}
          {(normalizedStatus !== WorkflowStatus.SENT_FOR_REVIEW || decision === 'reject') && (
            <TextField
              margin="normal"
              label="Comments"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              placeholder={decision === 'reject'
                ? "Please provide rejection comments"
                : "Enter your approval comments"}
              value={comments}
              onChange={handleCommentsChange}
              error={!!error && commentsRequired && !comments.trim()}
              helperText={error && commentsRequired && !comments.trim() 
                ? 'Comments are required' 
                : error}
              onClick={handleDialogClick}
            />
          )}
        </DialogContent>

        <DialogActions onClick={handleDialogClick}>
          <Button
            onClick={handleCancel}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            Submit Decision
          </Button>
        </DialogActions>
      </Dialog>
    );
};

export default SendApprovalBox;