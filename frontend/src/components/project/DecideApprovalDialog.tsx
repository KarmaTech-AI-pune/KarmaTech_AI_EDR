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

    const handleSubmit = async () => {
        if (!comments) {
            alert('Please add comments');
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
        } catch (error) {
            console.error('Error processing approval decision:', error);
            alert('Failed to process approval decision. Please try again.');
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
    );
};

export default DecideApprovalDialog;
