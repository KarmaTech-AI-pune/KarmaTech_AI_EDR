import React, { useState, useEffect, useContext } from 'react';
import { Button, Tooltip } from '@mui/material';
import { Send } from '@mui/icons-material';
import { pmWorkflowApi } from '../../api/pmWorkflowApi';
import { PMWorkflowStatus } from '../../models/pmWorkflowModel';
import { projectManagementAppContext } from '../../App';
import SendForReviewDialog from './SendForReviewDialog';
import DecideReviewDialog from './DecideReviewDialog';
import SendForApprovalDialog from './SendForApprovalDialog';
import DecideApprovalDialog from './DecideApprovalDialog';

interface PMWorkflowButtonProps {
    entityId: number;
    entityType: string;
    currentStatusId: number;
    onWorkflowUpdated: () => void;
}

const PMWorkflowButton: React.FC<PMWorkflowButtonProps> = ({ 
    entityId, 
    entityType, 
    currentStatusId, 
    onWorkflowUpdated 
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const context = useContext(projectManagementAppContext);
    
    // Check user roles
    const isPM = context?.currentUser?.roles?.includes('ProjectManager') || false;
    const isSPM = context?.currentUser?.roles?.includes('SeniorProjectManager') || false;
    const isRMRD = context?.currentUser?.roles?.includes('RegionalManager') || 
                  context?.currentUser?.roles?.includes('RegionalDirector') || false;
    
    const handleWorkflowClick = () => {
        setDialogOpen(true);
    };
    
    const handleDialogClose = () => {
        setDialogOpen(false);
    };
    
    const handleWorkflowUpdated = () => {
        setDialogOpen(false);
        onWorkflowUpdated();
    };
    
    // Determine if button should be shown based on status and user role
    const shouldShowButton = () => {
        switch (currentStatusId) {
            case PMWorkflowStatus.Initial:
            case PMWorkflowStatus.ReviewChanges:
                return isPM;
            case PMWorkflowStatus.SentForReview:
                return isSPM;
            case PMWorkflowStatus.SentForApproval:
            case PMWorkflowStatus.ApprovalChanges:
                return isRMRD;
            case PMWorkflowStatus.Approved:
                return false; // No workflow actions for approved items
            default:
                return false;
        }
    };
    
    // Get button text based on status and user role
    const getButtonText = () => {
        switch (currentStatusId) {
            case PMWorkflowStatus.Initial:
                return "Send for Review";
            case PMWorkflowStatus.ReviewChanges:
                return "Send for Review";
            case PMWorkflowStatus.SentForReview:
                return "Review";
            case PMWorkflowStatus.SentForApproval:
            case PMWorkflowStatus.ApprovalChanges:
                return "Approve";
            default:
                return "Workflow";
        }
    };
    
    // Render appropriate dialog based on status and user role
    const renderDialog = () => {
        switch (currentStatusId) {
            case PMWorkflowStatus.Initial:
            case PMWorkflowStatus.ReviewChanges:
                return (
                    <SendForReviewDialog
                        open={dialogOpen}
                        onClose={handleDialogClose}
                        entityId={entityId}
                        entityType={entityType}
                        onWorkflowUpdated={handleWorkflowUpdated}
                    />
                );
            case PMWorkflowStatus.SentForReview:
                return (
                    <DecideReviewDialog
                        open={dialogOpen}
                        onClose={handleDialogClose}
                        entityId={entityId}
                        entityType={entityType}
                        onWorkflowUpdated={handleWorkflowUpdated}
                    />
                );
            case PMWorkflowStatus.ApprovalChanges:
            case PMWorkflowStatus.SentForApproval:
                return (
                    <DecideApprovalDialog
                        open={dialogOpen}
                        onClose={handleDialogClose}
                        entityId={entityId}
                        entityType={entityType}
                        onWorkflowUpdated={handleWorkflowUpdated}
                    />
                );
            default:
                return null;
        }
    };
    
    if (!shouldShowButton()) {
        return null;
    }
    
    return (
        <>
            <Tooltip title={getButtonText()}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Send />}
                    onClick={handleWorkflowClick}
                >
                    {getButtonText()}
                </Button>
            </Tooltip>
            {renderDialog()}
        </>
    );
};

export default PMWorkflowButton;
