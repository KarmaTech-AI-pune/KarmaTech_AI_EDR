import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button
} from '@mui/material';
import { GoNoGoVersionStatus } from '../../models/workflowModel';

interface Props {
  status: GoNoGoVersionStatus;
  onApprove?: () => void;
  userRole: string;
  isEditable: boolean;
  score?: number;
}

const approvalSteps = [
  { label: 'BDM Review', role: 'Business Development Manager', pending: GoNoGoVersionStatus.BDM_PENDING, approved: GoNoGoVersionStatus.BDM_APPROVED },
  { label: 'RM Review', role: 'Regional Manager', pending: GoNoGoVersionStatus.RM_PENDING, approved: GoNoGoVersionStatus.RM_APPROVED },
  { label: 'RD Review', role: 'Regional Director', pending: GoNoGoVersionStatus.RD_PENDING, approved: GoNoGoVersionStatus.RD_APPROVED }
];

const getActiveStep = (status: GoNoGoVersionStatus): number => {
  switch (status) {
    case GoNoGoVersionStatus.BDM_APPROVED:    
      return 1; // After BDM approval, move to RM step.
    case GoNoGoVersionStatus.RM_APPROVED:
      return 2; // After RM approval, move to RD step.
    case GoNoGoVersionStatus.RD_APPROVED:
    case GoNoGoVersionStatus.COMPLETED:
      return 3; // After RD approval or completion, all steps are completed.
    default:
      return 0; // Default to the first step.
  }
};


const getStepState = (
  stepIndex: number,
  currentStatus: GoNoGoVersionStatus
): 'completed' | 'active' | 'pending' => {
  const activeStep = getActiveStep(currentStatus);
  debugger;
  if (stepIndex < activeStep ) return 'completed';
  if (stepIndex === activeStep ) return 'active';
  return 'pending';
};

const canUserApprove = (status: GoNoGoVersionStatus, userRole: string): boolean => {
  debugger;
  const currentStep = approvalSteps.find(step => 
    status === step.pending && userRole === step.role
  );
  return !!currentStep;
};

const GoNoGoApprovalStatus: React.FC<Props> = ({
  status,
  onApprove,
  userRole,
  isEditable,
  score
}) => {
  const activeStep = getActiveStep(status);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6">Approval Status</Typography>
          {score !== undefined && (
            <Typography variant="body1" sx={{ mt: 1 }}>
              Score: {score}
            </Typography>
          )}
        </Box>
        {canUserApprove(status, userRole) && onApprove && (
          <Button
            variant="contained"
            color="primary"
            onClick={onApprove}
            disabled={!isEditable}
          >
            Approve
          </Button>
        )}
      </Box>
      <Stepper activeStep={activeStep}>
        {approvalSteps.map((step, index) => {
          const stepState = getStepState(index, status);
          return (
            <Step key={step.label} completed={stepState === 'completed'}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {status === GoNoGoVersionStatus.COMPLETED && (
        <Typography sx={{ mt: 2, color: 'success.main' }}>
          All approvals completed
        </Typography>
      )}
    </Paper>
  );
};

export default GoNoGoApprovalStatus;
