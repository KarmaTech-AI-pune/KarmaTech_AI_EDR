import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  
  FormHelperText,
  TextField,
  Backdrop
} from '@mui/material';
import { getUserById } from '../../../services/userApi';
import { projectApi } from '../../../services/projectApi';
import { pmWorkflowApi } from '../../../api/pmWorkflowApi';

interface SendForApprovalProps {
  open: boolean;
  onClose: () => void;
  projectClosureId?: number;
  projectId?: number;
  currentUser: string | undefined;
  onSubmit?: () => void;
}

const SendForApproval: React.FC<SendForApprovalProps> = ({
  open,
  onClose,
  projectClosureId,
  projectId,
  currentUser,
  onSubmit
}) => {
  const [selectedApprover, setSelectedApprover] = useState<string>('');
 // const [approvers, setApprovers] = useState<AuthUser[]>([]);
  const [comments, setComments] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [manager, setManager] = useState<string | null>(null);

  useEffect(() => {

    const checkManager = async () => {
      if (projectClosureId && projectId) {
        try {
          // Check if there's an existing approval manager for this project
          const response = await projectApi.getById(projectId.toString());
          const workflowData = response;

          if (workflowData && workflowData.regionalManagerId) {
            const managerUser = await getUserById(workflowData.regionalManagerId);
            if (managerUser) {
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
  }, [projectClosureId, projectId]);

  // const handleApproverChange = (event: SelectChangeEvent<string>) => {
  //   setSelectedApprover(event.target.value);
  //   setError(null);
  // };

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
    console.log('handleSubmit called');
    console.log('projectClosureId:', projectClosureId);
    console.log('projectId:', projectId);
    console.log('currentUser:', currentUser);
    console.log('selectedApprover:', selectedApprover);
    
    // Clear any existing errors first
    setError(null);
    
    if (!projectClosureId) {
      console.log('Setting error: Project Closure ID is missing');
      setError('Project Closure ID is missing');
      console.log('Error state after setting:', error);
      return;
    }

    if (!projectId) {
      console.log('Setting error: Project ID is missing');
      setError('Project ID is missing');
      console.log('Error state after setting:', error);
      return;
    }

    if (!currentUser) {
      console.log('Setting error: Current user information is missing');
      setError('Current user information is missing');
      return;
    }

    if (!selectedApprover) {
      console.log('Setting error: Please select a Regional Director');
      setError('Please select a Regional Director');
      return;
    }

    try {

      // Send the project closure for approval
      await pmWorkflowApi.sendToApproval({
        entityId: projectClosureId,
        entityType: 'ProjectClosure',
        assignedToId: selectedApprover,
        action:"Approval",
        comments: comments || `Reviewed and sent for approval by ${currentUser}`
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
          <FormHelperText 
            error 
            sx={{ 
              mt: 2, 
              mb: 1,
              fontSize: '0.75rem',
              color: 'error.main'
            }}
            data-testid="error-message"
          >
            {error}
          </FormHelperText>
        )}
      </DialogContent>
      <DialogActions onClick={stopEventPropagation}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!!error || !selectedApprover}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendForApproval;
