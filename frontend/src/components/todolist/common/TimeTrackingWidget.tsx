import React, { useState } from 'react';
import {
    Box,
    Typography,
    LinearProgress,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
} from '@mui/material';
import { Edit, AssignmentInd } from '@mui/icons-material';

export interface WorkLogEntry {
    date: string;
    employeeName: string;
    hoursLogged: number;
    description: string;
}

interface TimeTrackingWidgetProps {
    taskName?: string; // Add this
    reporterName?: string; // Add this
    originalEstimate: number; // in hours
    remainingEstimate: number; // in hours
    timeSpent: number; // in hours
    onLogWork: (timeSpent: number, remainingEstimate: number, description: string, modalType: 'employee' | 'reporter') => void;
    recentLogs?: WorkLogEntry[];
    status?: string;
    storyPoints?: number;
    employeeLoggedHours?: number;
}

export const TimeTrackingWidget: React.FC<TimeTrackingWidgetProps> = ({
    taskName,
    reporterName,
    originalEstimate,
    remainingEstimate,
    timeSpent,
    onLogWork,
    recentLogs,
    status,
    storyPoints,
    employeeLoggedHours = 0,
}) => {
    const [logWorkModalType, setLogWorkModalType] = useState<'employee' | 'reporter' | null>(null);
    const [logTimeSpent, setLogTimeSpent] = useState('');
    const [logRemainingEstimate, setLogRemainingEstimate] = useState(remainingEstimate.toString());
    const [logDescription, setLogDescription] = useState('');

    // Calculate progress percentage
    // Based on Remaining Hours relative to Original Estimate
    let progress = 0;
    if (originalEstimate > 0) {
        // Progress = percentage of estimated work that is NOT remaining
        progress = Math.max(0, Math.min(100, ((originalEstimate - remainingEstimate) / originalEstimate) * 100));
    } else if (remainingEstimate === 0 && timeSpent > 0) {
        // Fallback for when there's no original estimate but work is done/finished
        progress = 100;
    }

    const isToDo = status === 'To Do';

    const handleLogWork = () => {
        const timeSpentVal = parseFloat(logTimeSpent);
        const remainingVal = logWorkModalType === 'employee' ? remainingEstimate : parseFloat(logRemainingEstimate);

        if (!isNaN(timeSpentVal)) {
            if (logWorkModalType) {
                onLogWork(timeSpentVal, remainingVal, logDescription, logWorkModalType);
            }
            setLogWorkModalType(null);
            setLogTimeSpent('');
            setLogDescription('');
        }
    };

    const cardStyle = {
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 1,
        p: 2,
        bgcolor: 'background.paper',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)'
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            filter: isToDo ? 'grayscale(0.5)' : 'none',
        }}>
            {/* Employee Work Log Card */}
            <Box sx={{
                ...cardStyle,
                opacity: isToDo ? 0.7 : 1,
                position: 'relative'
            }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    Employee Work Log
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Total Logged Hours</Typography>
                        <Typography variant="body2" fontWeight="bold">{employeeLoggedHours}h</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" display="block">Remaining Hours</Typography>
                        <Typography variant="body2" fontWeight="bold">{remainingEstimate}h</Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    fullWidth
                    disabled={isToDo}
                    onClick={() => {
                        setLogWorkModalType('employee');
                        setLogRemainingEstimate(remainingEstimate.toString());
                        setLogTimeSpent('');
                        setLogDescription('');
                    }}
                    sx={{ textTransform: 'none' }}
                >
                    Log Work
                </Button>
            </Box>

            {/* Work Reporter Card */}
            <Box sx={cardStyle}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentInd fontSize="small" color="action" />
                        <Typography variant="subtitle2" fontWeight="bold">Work Approver</Typography>
                    </Box>
                    <IconButton
                        size="small"
                        disabled={isToDo}
                        onClick={() => {
                            setLogWorkModalType('reporter');
                            setLogRemainingEstimate(remainingEstimate.toString());
                            setLogTimeSpent('');
                        }}
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mb: 2 }}>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: 'primary.main',
                            }
                        }}
                    />
                </Box>



                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">{Math.round(progress)}% complete</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {originalEstimate}h estimated employee work
                    </Typography>
                </Box>

                {/* Log Work Button */}
                {/* 
      <Button 
        variant="outlined" 
        fullWidth 
        startIcon={<AccessTime />}
        onClick={() => setIsLogWorkOpen(true)}
        sx={{ textTransform: 'none' }}
      >
        Log work
      </Button>
      */}

                {/* Log Work Modal */}
                <Dialog open={logWorkModalType !== null} onClose={() => setLogWorkModalType(null)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider', pb: 2, color: 'error.main' }}>
                        {logWorkModalType === 'employee' ? 'Work Report' : 'Work Approve'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

                            {logWorkModalType === 'employee' ? (
                                <>
                                    {/* Progress Bar inside modal */}
                                    <Box sx={{ mb: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="caption" fontWeight="bold">Complete work bar: {Math.round(progress)}%</Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={progress}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: 'grey.200',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: 'primary.main',
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Task Name"
                                                value={taskName || ''}
                                                fullWidth
                                                size="small"
                                                InputProps={{ readOnly: true }}
                                                sx={{ bgcolor: 'action.hover' }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Reporter"
                                                value={reporterName || ''}
                                                fullWidth
                                                size="small"
                                                InputProps={{ readOnly: true }}
                                                sx={{ bgcolor: 'action.hover' }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Total Logged Hours"
                                                value={employeeLoggedHours}
                                                fullWidth
                                                size="small"
                                                InputProps={{ readOnly: true }}
                                                sx={{ bgcolor: 'action.hover' }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Estimated Hours"
                                                value={originalEstimate}
                                                fullWidth
                                                size="small"
                                                InputProps={{ readOnly: true }}
                                                sx={{ bgcolor: 'action.hover' }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Work time spend"
                                                type="number"
                                                value={logTimeSpent}
                                                onChange={(e) => {
                                                    setLogTimeSpent(e.target.value);
                                                }}
                                                fullWidth
                                                autoFocus
                                                size="small"
                                                inputProps={{ min: 0, step: 0.5 }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Commite"
                                                multiline
                                                rows={2}
                                                placeholder="Briefly describe what you worked on..."
                                                fullWidth
                                                size="small"
                                                value={logDescription}
                                                onChange={(e) => setLogDescription(e.target.value)}
                                            />
                                        </Grid>

                                        {recentLogs && recentLogs.length > 0 && (
                                            <Grid item xs={12}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 1, mt: 1 }}>
                                                    Previous Commite
                                                </Typography>
                                                <Box sx={{
                                                    maxHeight: 150,
                                                    overflowY: 'auto',
                                                    bgcolor: 'grey.50',
                                                    p: 1.5,
                                                    borderRadius: 1,
                                                    border: '1px solid',
                                                    borderColor: 'grey.200',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 1.5
                                                }}>
                                                    {recentLogs.map((log, idx) => (
                                                        <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                <Typography variant="caption" fontWeight="bold" color="text.primary" sx={{ fontSize: '0.7rem' }}>
                                                                    {log.employeeName}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                                    {log.date}
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="caption" color="text.secondary" sx={{
                                                                fontSize: '0.7rem',
                                                                lineHeight: 1.4
                                                            }}>
                                                                {log.hoursLogged > 0 ? `Logged ${log.hoursLogged}h: ` : ''}{log.description}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                </>
                            ) : (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="Date"
                                            type="date"
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                            InputLabelProps={{ shrink: true }}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="Reporter"
                                            value={reporterName || ''}
                                            fullWidth
                                            size="small"
                                            InputProps={{ readOnly: true }}
                                            sx={{ bgcolor: 'action.hover' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="Assigne Story Point"
                                            value={storyPoints || 0}
                                            fullWidth
                                            size="small"
                                            InputProps={{ readOnly: true }}
                                            sx={{ bgcolor: 'action.hover' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Actual work time spent (hours)"
                                            type="number"
                                            value={logTimeSpent}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setLogTimeSpent(val);
                                                // Auto-calculate remaining estimate
                                                if (val && !isNaN(parseFloat(val))) {
                                                    const timeSpentNow = parseFloat(val);
                                                    const newRemaining = Math.max(0, remainingEstimate - timeSpentNow);
                                                    setLogRemainingEstimate(newRemaining.toString());
                                                } else {
                                                    setLogRemainingEstimate(remainingEstimate.toString());
                                                }
                                            }}
                                            fullWidth
                                            autoFocus
                                            size="small"
                                            inputProps={{ min: 0, step: 0.5 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            label="Task Name"
                                            value={taskName || ''}
                                            fullWidth
                                            size="small"
                                            InputProps={{ readOnly: true }}
                                            sx={{ bgcolor: 'action.hover' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="Remaining Estimate (hours)"
                                            type="number"
                                            value={logRemainingEstimate}
                                            onChange={(e) => setLogRemainingEstimate(e.target.value)}
                                            fullWidth
                                            size="small"
                                            InputProps={{ readOnly: true }}
                                            sx={{ bgcolor: 'action.hover' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Commite"
                                            multiline
                                            rows={2}
                                            placeholder="Update message..."
                                            fullWidth
                                            size="small"
                                            value={logDescription}
                                            onChange={(e) => setLogDescription(e.target.value)}
                                        />
                                    </Grid>

                                    {recentLogs && recentLogs.length > 0 && (
                                        <Grid item xs={12}>
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 1, mt: 1 }}>
                                                Previous Commite
                                            </Typography>
                                            <Box sx={{
                                                maxHeight: 150,
                                                overflowY: 'auto',
                                                bgcolor: 'grey.50',
                                                p: 1.5,
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: 'grey.200',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1.5
                                            }}>
                                                {recentLogs.map((log, idx) => (
                                                    <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <Typography variant="caption" fontWeight="bold" color="text.primary" sx={{ fontSize: '0.7rem' }}>
                                                                {log.employeeName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                                {log.date}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{
                                                            fontSize: '0.7rem',
                                                            lineHeight: 1.4
                                                        }}>
                                                            {log.hoursLogged > 0 ? `Logged ${log.hoursLogged}h: ` : ''}{log.description}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 0 }}>
                        <Button onClick={() => setLogWorkModalType(null)} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
                        <Button variant="contained" onClick={handleLogWork} disabled={!logTimeSpent} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>
                            {logWorkModalType === 'employee' ? 'Log Work' : 'Work Report Submit'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};
