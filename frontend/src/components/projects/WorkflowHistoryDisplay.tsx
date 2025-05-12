import React, { useState, useEffect } from 'react';
import { 
    Typography, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    Chip,
    CircularProgress,
    Box
} from '@mui/material';
import { pmWorkflowApi } from '../../api/pmWorkflowApi';
import { PMWorkflowHistoryResponse, PMWorkflowStatus } from '../../models/pmWorkflowModel';

interface WorkflowHistoryDisplayProps {
    entityId: number;
    entityType: string;
}

const WorkflowHistoryDisplay: React.FC<WorkflowHistoryDisplayProps> = ({
    entityId,
    entityType
}) => {
    const [workflowHistory, setWorkflowHistory] = useState<PMWorkflowHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        loadWorkflowHistory();
    }, [entityId, entityType]);
    
    const loadWorkflowHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const history = await pmWorkflowApi.getWorkflowHistory(entityType, entityId);
            setWorkflowHistory(history);
        } catch (err) {
            console.error('Error loading workflow history:', err);
            setError('Failed to load workflow history');
        } finally {
            setLoading(false);
        }
    };
    
    const getStatusChip = (statusId: number) => {
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
        
        switch (statusId) {
            case PMWorkflowStatus.Initial:
                color = 'default';
                break;
            case PMWorkflowStatus.SentForReview:
                color = 'info';
                break;
            case PMWorkflowStatus.ReviewChanges:
                color = 'warning';
                break;
            case PMWorkflowStatus.SentForApproval:
                color = 'primary';
                break;
            case PMWorkflowStatus.ApprovalChanges:
                color = 'warning';
                break;
            case PMWorkflowStatus.Approved:
                color = 'success';
                break;
        }
        
        return (
            <Chip 
                label={workflowHistory?.history.find(h => h.statusId === statusId)?.status || `Status ${statusId}`} 
                color={color} 
                size="small" 
            />
        );
    };
    
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (error) {
        return (
            <Typography color="error">{error}</Typography>
        );
    }
    
    if (!workflowHistory || workflowHistory.history.length === 0) {
        return (
            <Typography variant="body2" color="textSecondary">
                No workflow history available
            </Typography>
        );
    }
    
    return (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Workflow Status: {getStatusChip(workflowHistory.currentStatusId)}
            </Typography>
            
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>By</TableCell>
                            <TableCell>Assigned To</TableCell>
                            <TableCell>Comments</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {workflowHistory.history.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {new Date(item.actionDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{item.action}</TableCell>
                                <TableCell>{getStatusChip(item.statusId)}</TableCell>
                                <TableCell>{item.actionByName}</TableCell>
                                <TableCell>{item.assignedToName || '-'}</TableCell>
                                <TableCell>{item.comments}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default WorkflowHistoryDisplay;
