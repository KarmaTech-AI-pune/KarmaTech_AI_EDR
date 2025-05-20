import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import React, { useState, useContext } from 'react'
import { projectManagementAppContext } from '../../../App';
import { projectManagementAppContextType } from '../../../types';
import { TaskType } from '../../../types/wbs';

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
    status,
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

    const handleDecisionChange = (event: SelectChangeEvent) => {
        event.stopPropagation();
        setDecision(event.target.value as DecisionType);
        setError(null);
      };

    const handleCommentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        setComments(event.target.value);
        setError(null);
      };

    const handleCancel = (event: React.MouseEvent) => {
        event.stopPropagation();
        setDecision('');
        setComments('');
        setError(null);
        onClose();
      };

    const handleDialogClick = (event: React.MouseEvent) => {
        event.stopPropagation();
      };

    const handleSubmit = async (event: React.MouseEvent) => {
        event.stopPropagation();
        if (!decision) {
          setError('Please select a decision');
          return;
        }

        // For 'Sent for Review' status, comments are required only for rejection
        if (status === 'Sent for Review') {
          if (decision === 'reject' && !comments.trim()) {
            setError('Please provide comments for rejection');
            return;
          }
        }
        // For all other statuses, comments are required for both approve and reject
        else if (!comments.trim()) {
          setError('Comments are required');
          return;
        }

        // Create payload based on status and decision
        let payload = {
          statusId: 0,
          Action: '',
          comments: comments, // Changed from 'comment' to 'comments' to match backend expectation
          AssignedBy: context.currentUser?.id || '', // Current user's ID from context
          AssignedTo: '', // Project Manager ID from the selected project
          entityId: entityId,
          entityType: entityType,
          formType: formType
        };

        if (status === 'Sent for Review') {
          if (decision === 'approve') {
            payload.statusId = 4;
            payload.Action = 'Approval'; // Changed to match backend action
            payload.AssignedTo = context.selectedProject && 'regionalManagerId' in context.selectedProject
            ? context.selectedProject.regionalManagerId
            : '';
          } else { // reject
            payload.statusId = 3;
            payload.Action = 'Reject'; // Changed to match backend action
            payload.AssignedTo = context.selectedProject && 'projectManagerId' in context.selectedProject
            ? context.selectedProject.projectManagerId
            : '';
          }
        } else if (status === 'Sent for Approval') {
          if (decision === 'approve') {
            payload.statusId = 6;
            payload.Action = 'Approved';
            // For approval, we don't need to assign to anyone, but the backend expects a value
            // Use the current user's ID as a fallback
            payload.AssignedTo = context.currentUser?.id || '';

          } else { // reject
            payload.statusId = 5;
            payload.Action = 'Reject'; // Changed to match backend action

            // Make sure we're assigning to SPM, not PM
            if (context.selectedProject && 'seniorProjectManagerId' in context.selectedProject) {
              payload.AssignedTo = context.selectedProject.seniorProjectManagerId;
              console.log("Assigning rejected form to SPM:", payload.AssignedTo);
            } else {
              console.warn("Could not find seniorProjectManagerId in selectedProject");
              payload.AssignedTo = '';
            }
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
    }

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
            <DialogTitle onClick={handleDialogClick}>{status === 'Sent for Review' ? 'Decide Review' : 'Decide Approval'}</DialogTitle>
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


                {status !== 'Sent for Review' && (
                <TextField
                          margin="normal"
                          label="Comments"
                          multiline
                          rows={4}
                          fullWidth
                          variant="outlined"
                          placeholder={decision === 'reject' ?
                            "Please provide rejection comments" :
                            "Enter your approval comments"}
                          value={comments}
                          onChange={handleCommentsChange}
                          error={!!error && !comments.trim()}
                          helperText={error && !comments.trim() ? 'Comments are required' : error}
                          onClick={handleDialogClick}
                        />)}

                        {status === 'Sent for Review' && decision === 'reject' && (
                <TextField
                          margin="normal"
                          label="Comments"
                          multiline
                          rows={4}
                          fullWidth
                          variant="outlined"
                          placeholder={decision === 'reject' ?
                            "Please provide rejection comments" :
                            "Enter your approval comments"}
                          value={comments}
                          onChange={handleCommentsChange}
                          error={!!error && !comments.trim()}
                          helperText={error && !comments.trim() ? 'Comments are required' : error}
                          onClick={handleDialogClick}
                        />)}
            </DialogContent>

            <DialogActions
            onClick={handleDialogClick}
            >
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
                      disabled={ status === 'Sent for Review'
                        ? !decision || (decision === 'reject' && !comments.trim())
                        : !decision || !comments.trim()}
                    >
                      Submit Decision
                    </Button>
                  </DialogActions>

    </Dialog>
  )
}

export default SendApprovalBox
