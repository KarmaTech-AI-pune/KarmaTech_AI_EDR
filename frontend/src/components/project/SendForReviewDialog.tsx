import React, { useState, useEffect } from 'react';
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
    Typography
} from '@mui/material';
import { pmWorkflowApi } from '../../api/pmWorkflowApi';
import * as userApi from '../../services/userApi';

interface SendForReviewDialogProps {
    open: boolean;
    onClose: () => void;
    entityId: number;
    entityType: string;
    onWorkflowUpdated: () => void;
}

const SendForReviewDialog: React.FC<SendForReviewDialogProps> = ({
    open,
    onClose,
    entityId,
    entityType,
    onWorkflowUpdated
}) => {
    const [comments, setComments] = useState('');
    const [assignedToId, setAssignedToId] = useState('');
    const [spmUsers, setSpmUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    
    useEffect(() => {
        if (open) {
            loadSPMUsers();
        }
    }, [open]);

    const loadSPMUsers = async () => {
        setLoading(true);
        try {
            // Get users with SPM role
            const users = await userApi.getUsersByRole('SeniorProjectManager');
            setSpmUsers(users);

            // If there's only one SPM, select them automatically
            if (users.length === 1) {
                setAssignedToId(users[0].id);
            }
        } catch (error) {
            console.error('Error loading SPM users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!assignedToId) {
            alert('Please select a Senior Project Manager');
            return;
        }

        setSubmitting(true);
        try {
            await pmWorkflowApi.sendToReview({
                entityId,
                entityType,
                assignedToId,
                comments,
                action: ''
            });

            onWorkflowUpdated();
        } catch (error) {
            console.error('Error sending for review:', error);
            alert('Failed to send for review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setComments('');
        setAssignedToId('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Send for Review</DialogTitle>
            <DialogContent>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <>
                        <Typography variant="body1" gutterBottom>
                            Send this form to a Senior Project Manager for review.
                        </Typography>

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="spm-select-label">Senior Project Manager</InputLabel>
                            <Select
                                labelId="spm-select-label"
                                value={assignedToId}
                                onChange={(e) => setAssignedToId(e.target.value as string)}
                                label="Senior Project Manager"
                                required
                            >
                                {spmUsers.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name || user.userName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Comments"
                            multiline
                            rows={4}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            fullWidth
                            margin="normal"
                            placeholder="Add any comments or notes for the reviewer"
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={loading || submitting || !assignedToId}
                >
                    {submitting ? <CircularProgress size={24} /> : 'Send for Review'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SendForReviewDialog;
