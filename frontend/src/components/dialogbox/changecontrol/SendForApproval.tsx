import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormHelperText,
  TextField,
  Backdrop
} from '@mui/material';
import { AuthUser } from '../../../models/userModel';
import { getUsersByRole, getUserById } from '../../../services/userApi';
import { projectApi } from '../../../services/projectApi';
import { changeControlApi } from '../../../services/changeControlApi';

interface SendForApprovalProps {
  open: boolean;
  onClose: () => void;
  changeControlId?: number;
  projectId?: number;
  currentUser: string | undefined;
  onSubmit?: () => void;
}

const SendForApproval: React.FC<SendForApprovalProps> = ({
  open,
  onClose,
  changeControlId,
  projectId,
  currentUser,
  onSubmit
}) => {
  const [selectedApprover, setSelectedApprover] = useState<string>('');
  const [approvers, setApprovers] = useState<AuthUser[]>([]);
  const [comments, setComments] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [manager, setManager] = useState<string | null>(null);

  useEffect(() => {

    const checkManager = async () => {
      debugger;
      if (changeControlId && projectId) {
        try {
          // Check if there's an existing approval manager for this change control
          const response = await projectApi.getById(projectId.toString());
          const workflowData = response;

          if (workflowData && workflowData.regionalManagerId) {
            const managerUser = await getUserById(workflowData.regionalManagerId);
            if (managerUser) {
              debugger;
              setManager(managerUser.name);
              setSelectedApprover(workflowData.regionalManagerId);
            } else {
              setError("404: Manager User not found");
            }
          }
        } catch (err: unknown) {
          const errorMessage = err instanceof Error
            ? err.message
            : 'Failed to retrieve manager information';
          console.error('Error checking manager:', err);
          setError(errorMessage);
        }
      }
    };
    
    checkManager();
  }, [changeControlId, projectId]);

  const handleApproverChange = (event: SelectChangeEvent<string>) => {
    setSelectedApprover(event.target.value);
    setError(null);
  };

  const handleCommentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComments(event.target.value);
  };

  const handleCancel = () => {
    setSelectedApprover('');
    setComments('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedApprover) {
      setError('Please select a Regional Director');
      return;
    }

    if (!changeControlId) {
      setError('Change Control ID is missing');
      return;
    }

    if (!projectId) {
      setError('Project ID is missing');
      return;
    }

    if (!currentUser) {
      setError('Current user information is missing');
      return;
    }

    try {      

      // Send the change control for approval
      await changeControlApi.sendToApprovalBySPM({
        entityId: changeControlId,
        entityType: 'ChangeControl',
        action: "Approval",
        assignedToId: selectedApprover,
        comments: comments || `Reviewed  and sent for approval by ${currentUser}`
      });

      // Reset dialog state
      setSelectedApprover('');
      setComments('');
      setError(null);

      // Call callback if provided
      if (onSubmit) {
        onSubmit();
      }

      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to send for approval';
      setError(errorMessage);
      console.error(err);
    }
  };

  // Don't render the dialog if currentUser is not available
  if (!currentUser) {
    return null;
  }

  const stopEventPropagation = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      onClick={stopEventPropagation}
      onKeyDown={stopEventPropagation}
      sx={{
        '& .MuiDialog-paper': {
          position: 'relative'
        },
        zIndex: 1300 // Standard MUI dialog z-index
      }}
      BackdropComponent={Backdrop}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
      PaperProps={{
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        },
        onClick: stopEventPropagation
      }}
    >
      <DialogTitle>Send for Approval</DialogTitle>
      <DialogContent onClick={stopEventPropagation}>
        <FormControl
          fullWidth
          margin="normal"
          error={!!error}
        >
          {manager && (
            <div style={{
              fontSize: '16px',
              padding: '8px 0',
              textAlign: 'center'
            }}>
              Send to {manager} for approval?
            </div>
          )}

          <TextField
            label="Comments"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={comments}
            onChange={handleCommentsChange}
            placeholder="Add your comments here (optional)"
          />

          {error && (
            <FormHelperText error>
              {error}
            </FormHelperText>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions onClick={stopEventPropagation}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!selectedApprover}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendForApproval;
