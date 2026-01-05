import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
} from '@mui/material';
import { pmWorkflowApi } from '../../api/pmWorkflowApi';
import * as userApi from '../../services/userApi';
import NotificationSnackbar from '../widgets/NotificationSnackbar';

interface DecideReviewDialogProps {
    open: boolean;
    onClose: () => void;
    entityId: number;
    entityType: string;
    onWorkflowUpdated: () => void;
}

const DecideReviewDialog: React.FC<DecideReviewDialogProps> = ({
    open,
    onClose,
    entityId,
    entityType,
    onWorkflowUpdated
}) => {
    const [decision, setDecision] = useState('');
    const [comments, setComments] = useState('');
    const [assignedToId, setAssignedToId] = useState('');
    const [rmrdUsers, setRmrdUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Snackbar state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    React.useEffect(() => {
        if (open && decision === 'approve') {
            loadRMRDUsers();
        }
    }, [open, decision]);

    const loadRMRDUsers = async () => {
        setLoading(true);
        try {
            const rmUsers = await userApi.getUsersByRole('RegionalManager');
            const rdUsers = await userApi.getUsersByRole('RegionalDirector');
            const users = [...rmUsers, ...rdUsers];
            setRmrdUsers(users);

            if (users.length === 1) {
                setAssignedToId(users[0].id);
            }
        } catch (error) {
            console.error('Error loading RM/RD users:', error);
            showSnackbar('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleSubmit = async () => {
        // Payload Validation
        if (!entityId) {
            showSnackbar('Error: Missing Entity ID', 'error');
            return;
        }

        if (!entityType) {
            showSnackbar('Error: Missing Entity Type', 'error');
            return;
        }

        if (decision === 'approve' && !assignedToId) {
            showSnackbar('Please select a Regional Manager or Regional Director', 'error');
            return;
        }

        if (!comments) {
            showSnackbar('Please add comments', 'error');
            return;
        }

        setSubmitting(true);
        try {
            if (decision === 'approve') {
                await pmWorkflowApi.sendToApproval({
                    entityId,
                    entityType,
                    assignedToId,
                    comments,
                    action: 'approve'
                });
            } else {
                await pmWorkflowApi.requestChanges({
                    entityId,
                    entityType,
                    comments,
                    isApprovalChanges: false,
                    action: 'Reject'
                });
            }

            onWorkflowUpdated();
            handleClose();
        } catch (error: any) {
            console.error('Error processing review decision:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to process review decision';
            showSnackbar(errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setDecision('');
        setComments('');
        setAssignedToId('');
        onClose();
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Review Decision</DialogTitle>
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
                                label="Send for Approval"
                            />
                            <FormControlLabel
                                value="reject"
                                control={<Radio />}
                                label="Request Changes"
                            />
                        </RadioGroup>
                    </FormControl>

                    {decision === 'approve' && (
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="rmrd-select-label">Regional Manager/Director</InputLabel>
                            <Select
                                labelId="rmrd-select-label"
                                value={assignedToId}
                                onChange={(e) => setAssignedToId(e.target.value as string)}
                                label="Regional Manager/Director"
                                required
                            >
                                {rmrdUsers.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name || user.userName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <TextField
                        label={decision === 'approve' ? "Comments for Approval" : "Change Request Comments"}
                        multiline
                        rows={4}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        fullWidth
                        margin="normal"
                        placeholder={decision === 'approve'
                            ? "Add any comments for the approver"
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
                        disabled={loading || submitting || !decision || !comments || (decision === 'approve' && !assignedToId)}
                    >
                        {submitting ? <CircularProgress size={24} /> :
                            decision === 'approve' ? 'Send for Approval' : 'Request Changes'}
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

export default DecideReviewDialog;
