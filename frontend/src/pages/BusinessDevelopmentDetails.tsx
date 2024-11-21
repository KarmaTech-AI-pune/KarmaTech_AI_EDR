import { useContext, useState, useEffect } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { projectManagementAppContext } from '../App';
import { BusinessDevelopmentWidget } from '../components/widgets/BusinessDevelopmentWidget';
import { HistoryWidget } from '../components/widgets/HistoryWidget';
import { OpportunityTracking, UserWithRole } from '../types';
import { getHistoriesByOpportunityId } from '../dummyapi/database/dummyOpportunityHistory';
import SendIcon from '@mui/icons-material/Send';
import { WorkflowStatus } from '../dummyapi/database/dummyopportunityTracking';
import { PermissionType } from '../dummyapi/database/dummyRoles';
import { authApi } from '../dummyapi/authApi';
import { DecideApproval, DecideReview, SendForReview } from '../components/dialogbox';

export const BusinessDevelopmentDetails = () => {
  const context = useContext(projectManagementAppContext);
  const opportunity = context?.selectedProject as OpportunityTracking;
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [canSubmitForReview, setCanSubmitForReview] = useState(false);
  const [canReviewBD, setCanReviewBD] = useState(false);
  const [canApproveBD, setCanApproveBD] = useState(false);

  useEffect(() => {
    const checkUserPermissions = async () => {
      try {
        const user = await authApi.getCurrentUser();
        
        if (!user || !user.name) {
          setCurrentUser(null);
          setCanSubmitForReview(false);
          setCanReviewBD(false);
          setCanApproveBD(false);
          return;
        }

        setCurrentUser(user);

        if (user.roleDetails) {
          setCanSubmitForReview(
            user.roleDetails.permissions.includes(PermissionType.SUBMIT_FOR_REVIEW)
          );
          setCanReviewBD(
            user.roleDetails.permissions.includes(PermissionType.REVIEW_BUSINESS_DEVELOPMENT)
          );
          setCanApproveBD(
            user.roleDetails.permissions.includes(PermissionType.APPROVE_BUSINESS_DEVELOPMENT)
          );
        }
      } catch (error) {
        console.error('Error checking user permissions:', error);
        setCanSubmitForReview(false);
        setCanReviewBD(false);
        setCanApproveBD(false);
      }
    };

    checkUserPermissions();
  }, []);

  if (!opportunity) {
    return (
      <Container>
        <Typography variant="h6">No opportunity data found</Typography>
      </Container>
    );
  }

  const histories = getHistoriesByOpportunityId(opportunity.id);

  const handleWorkflowDialogOpen = () => {
    setWorkflowDialogOpen(true);
  };

  const handleWorkflowDialogClose = () => {
    setWorkflowDialogOpen(false);
  };

  const handleWorkflowComplete = () => {
    // Refresh the opportunity data
    if (context?.setSelectedProject) {
      context.setSelectedProject(null);
      context.setSelectedProject(opportunity);
    }
    handleWorkflowDialogClose();
  };

  const getWorkflowButtonText = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.Initial:
      case WorkflowStatus.ReviewChanges:
        return 'Send for Review';
      case WorkflowStatus.SentForReview:
      case WorkflowStatus.ApprovalChanges:
        return 'Decide Review';
      case WorkflowStatus.SentForApproval:
        return 'Decide Approval';
      default:
        return 'Send for Review';
    }
  };

  const canShowWorkflowButton = () => {
    if (!currentUser?.name || opportunity.workflowStatus === WorkflowStatus.Approved) {
      return false;
    }

    switch (opportunity.workflowStatus) {
      case WorkflowStatus.Initial:
      case WorkflowStatus.ReviewChanges:
        return canSubmitForReview;
      case WorkflowStatus.SentForReview:
      case WorkflowStatus.ApprovalChanges:
        return canReviewBD;
      case WorkflowStatus.SentForApproval:
        return canApproveBD;
      default:
        return false;
    }
  };

  const getWorkflowDialog = () => {
    // Only render dialog if we have a valid user with a name
    if (!currentUser?.name || !workflowDialogOpen) {
      return null;
    }

    const commonProps = {
      open: workflowDialogOpen,
      onClose: handleWorkflowDialogClose,
      opportunityId: opportunity.id,
      currentUser: currentUser.name,
      onSubmit: handleWorkflowComplete
    };

    switch (opportunity.workflowStatus) {
      case WorkflowStatus.Initial:
      case WorkflowStatus.ReviewChanges:
        return <SendForReview {...commonProps} />;
      case WorkflowStatus.SentForReview:
      case WorkflowStatus.ApprovalChanges:
        return <DecideReview {...commonProps} />;
      case WorkflowStatus.SentForApproval:
        return <DecideApproval {...commonProps} />;
      default:
        return <SendForReview {...commonProps} />;
    }
  };

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {opportunity.workName}
          </Typography>
          {canShowWorkflowButton() && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={handleWorkflowDialogOpen}
            >
              {getWorkflowButtonText(opportunity.workflowStatus)}
            </Button>
          )}
        </Box>
        
        <BusinessDevelopmentWidget opportunity={opportunity} />
        <HistoryWidget histories={histories} title={`History - ${opportunity.workName}`} />
      </Box>

      {/* Workflow Dialog */}
      {getWorkflowDialog()}
    </Container>
  );
};
