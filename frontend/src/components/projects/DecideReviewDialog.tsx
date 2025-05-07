import React, { useState, useContext } from 'react';
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
    Box
} from '@mui/material';
import { projectManagementAppContext } from '../../App';
import { pmWorkflowApi } from '../../api/pmWorkflowApi';
import { userApi } from '../../api/userApi';

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
    const context = useContext(projectManagementAppContext);
    
    React.useEffect(() => {
        if (open && decision === 'approve') {
            loadRMRDUsers();
        }
    }, [open, decision]);
    
    const loadRMRDUsers = async () => {
        setLoading(true);
        try {
            // Get users with RM or RD role
            const users = await userApi.getUsersByRoles(['RegionalManager', 'RegionalDirector']);
            setRmrdUsers(users);
            
            // If there's only one RM/RD, select them automatically
            if (users.length === 1) {
                setAssignedToId(users[0].id);
            }
        } catch (error) {
            console.error('Error loading RM/RD users:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSubmit = async () => {
        if (decision === 'approve' && !assignedToId) {
            alert('Please select a Regional Manager or Regional Director');
            return;
        }
        
        if (!comments) {
            alert('Please add comments');
            return;
        }
        
        setSubmitting(true);
        try {
            if (decision === 'approve') {
                await pmWorkflowApi.sendToApproval({
                    entityId,
                    entityType,
                    assignedToId,
                    comments
                });
            } else {
                await pmWorkflowApi.requestChanges({
                    entityId,
                    entityType,
                    comments,
                    isApprovalChanges: false
                });
            }
            
            onWorkflowUpdated();
        } catch (error) {
            console.error('Error processing review decision:', error);
            alert('Failed to process review decision. Please try again.');
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
    );
};

export default DecideReviewDialog;
