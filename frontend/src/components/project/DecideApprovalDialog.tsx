import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl
} from '@mui/material';
import { pmWorkflowApi } from '../../api/pmWorkflowApi';
import NotificationSnackbar from '../widgets/NotificationSnackbar';

interface DecideApprovalDialogProps {
    open: boolean;
    onClose: () => void;
    entityId: number;
    entityType: string;
    onWorkflowUpdated: () => void;
}

const DecideApprovalDialog: React.FC<DecideApprovalDialogProps> = ({
    open,
    onClose,
    entityId,
    entityType,
    onWorkflowUpdated
}) => {
    const [decision, setDecision] = useState('');
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Snackbar state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleSubmit = async () => {
        if (!entityId) {
            showSnackbar('Error: Missing Entity ID', 'error');
            return;
        }

        if (!entityType) {
            showSnackbar('Error: Missing Entity Type', 'error');
            return;
        }

        if (!comments) {
            showSnackbar('Please add comments', 'error');
            return;
        }

        setSubmitting(true);
        try {
            if (decision === 'approve') {
                await pmWorkflowApi.approvedByRDOrRM({
                    entityId,
                    entityType,
                    comments,
                    action: 'Approve'
                });
            } else {
                // Get the project to find the SPM ID
                const projectResponse = await fetch(`/api/projects/${entityId}`);
                if (!projectResponse.ok) {
                    throw new Error('Failed to fetch project details');
                }
                const project = await projectResponse.json();

                // If rejection, assign to SPM instead of PM
                await pmWorkflowApi.requestChanges({
                    entityId,
                    entityType,
                    comments,
                    isApprovalChanges: true,
                    assignedToId: project.seniorProjectManagerId?.toString() || '', // Assign to SPM
                    action: 'Request Changes'
                });
            }

            onWorkflowUpdated();
            handleClose();
        } catch (error: any) {
            console.error('Error processing approval decision:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to process approval decision';
            showSnackbar(errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setDecision('');
        setComments('');
        onClose();
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Approval Decision</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Please review this form and decide whether to approve it or request changes.
                    </Typography>

                    <FormControl component="fieldset" margin="normal" required>
                        <RadioGroup
                            value={decision}
                            onChange={(e) => setDecision(e.target.value)}
                        >
                            <FormControlLabel
                                value="approve"
                                control={<Radio />}
                                label="Approve"
                            />
                            <FormControlLabel
                                value="reject"
                                control={<Radio />}
                                label="Request Changes"
                            />
                        </RadioGroup>
                    </FormControl>

                    <TextField
                        label={decision === 'approve' ? "Approval Comments" : "Change Request Comments"}
                        multiline
                        rows={4}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        fullWidth
                        margin="normal"
                        placeholder={decision === 'approve'
                            ? "Add any comments for the approval"
                            : "Explain what changes are needed"}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                        disabled={submitting || !decision || !comments}
                    >
                        {submitting ? <CircularProgress size={24} /> :
                            decision === 'approve' ? 'Approve' : 'Request Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            <NotificationSnackbar
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={handleSnackbarClose}
            />
        </>
    );
};

export default DecideApprovalDialog;
