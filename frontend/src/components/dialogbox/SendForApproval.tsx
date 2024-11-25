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
  FormHelperText
} from '@mui/material';
import { UserRole } from '../../dummyapi/database/dummyusers';
import { getUsersByRole, getUserById } from '../../dummyapi/database/dummyusers';
import { opportunityApi } from '../../dummyapi/opportunityApi';
import { WorkflowStatus } from '../../dummyapi/database/dummyopportunityTracking';
import { AuthUser } from '../../dummyapi/database/dummyusers';
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
  const [selectedApprover, setSelectedApprover] = useState<number>(0);
  const [approvers, setApprovers] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [manager,setManager] = useState<string | null>(null);

  useEffect(() => {
    const checkManager = async() =>{
      if(opportunityId){
        let res =  await opportunityApi.getById(opportunityId)
        console.log("opportunity",res)

        if(res.approvalManagerId)
        {
          let managerUser = await getUserById(res.approvalManagerId)
          if(managerUser)
          {
          setManager(managerUser.name)
          setSelectedApprover(res.approvalManagerId)
          }
          else setError("404: ManagerUser not found")
        }
        else{
          
        }
      }
      else console.log("No ID for opp")

    }
    // Get all Regional Managers
    const regionalManagers = getUsersByRole(UserRole.RegionalManager);
    setApprovers(regionalManagers);
    checkManager();
  }, []);

  const handleApproverChange = (event: SelectChangeEvent) => {
    setSelectedApprover(Number(event.target.value));
    setError(null);
  };

  const handleCancel = () => {
    setSelectedApprover(0);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedApprover) {
      setError('Please select a Regional Manager');
      return;
    }

    try {
      const opportunity = await opportunityApi.getById(opportunityId);
      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      // Find selected approver details
      const selectedApproverDetails = approvers.find(a => a.id === selectedApprover);
      if (!selectedApproverDetails) {
        throw new Error('Selected approver not found');
      }

      // Update opportunity with new workflow status and approver
      const updatedOpportunity = {
        ...opportunity,
        workflowStatus: WorkflowStatus.SentForApproval,
        approvalManagerId: selectedApprover,
        status: 'Pending Approval'
      };

      await opportunityApi.update(updatedOpportunity);

      // Log the approval request
      await HistoryLoggingService.logCustomEvent(
        opportunityId,
        'Sent for Approval',
        currentUser,
        `Sent to ${selectedApproverDetails.name} for approval`
      );

      // Reset and close dialog
      setSelectedApprover(0);
      setError(null);
      
      if (onSubmit) {
        onSubmit();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send for approval');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          zIndex: 1500,
        },
        '& .MuiBackdrop-root': {
          zIndex: 1400,
        },
        '& .MuiSelect-select': {
          zIndex: 1600,
        },
        '& .MuiPopover-root': {
          zIndex: 1700,
        },
      }}
    >
      <DialogTitle sx={{ zIndex: 1550 }}>Send for Approval</DialogTitle>
      <DialogContent sx={{ zIndex: 1550 }}>
        <FormControl 
          fullWidth 
          margin="normal"
          error={!!error}
          sx={{ zIndex: 1550 }}
        >
           {manager? (<div>
            Send to {manager} for approval?
          </div> ) : (
            <>
          <InputLabel sx={{ zIndex: 1560 }}>Regional Manager</InputLabel>
          <Select
            value={selectedApprover.toString()}
            onChange={handleApproverChange}
            label="Regional Manager"
            sx={{ zIndex: 1550 }}
          >
            {approvers.map((approver) => (
              <MenuItem key={approver.id} value={approver.id}>
                {approver.name}
              </MenuItem>
            ))}
          </Select>
          </>)}
          {error && <FormHelperText sx={{ zIndex: 1560 }}>{error}</FormHelperText>}
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ zIndex: 1550 }}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!selectedApprover}
        >
          Send for Approval
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendForApproval;
