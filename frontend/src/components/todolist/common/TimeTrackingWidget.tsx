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
} from '@mui/material';
import { AccessTime, Edit } from '@mui/icons-material';

interface TimeTrackingWidgetProps {
    originalEstimate: number; // in hours
    remainingEstimate: number; // in hours
    timeSpent: number; // in hours
    onLogWork: (timeSpent: number, remainingEstimate: number) => void;
    onUpdateOriginalEstimate: (newEstimate: number) => void;
}

export const TimeTrackingWidget: React.FC<TimeTrackingWidgetProps> = ({
    originalEstimate,
    remainingEstimate,
    timeSpent,
    onLogWork,
    onUpdateOriginalEstimate,
}) => {
    const [isLogWorkOpen, setIsLogWorkOpen] = useState(false);
    const [logTimeSpent, setLogTimeSpent] = useState('');
    const [logRemainingEstimate, setLogRemainingEstimate] = useState(remainingEstimate.toString());

    // Calculate progress percentage
    // Jira style: Time Spent / (Time Spent + Remaining Estimate)
    const totalTime = timeSpent + remainingEstimate;
    let progress = 0;
    if (totalTime > 0) {
        progress = (timeSpent / totalTime) * 100;
    } else if (remainingEstimate === 0 && originalEstimate > 0) {
        progress = 100;
    }

    const handleLogWork = () => {
        const timeSpentVal = parseFloat(logTimeSpent);
        const remainingVal = parseFloat(logRemainingEstimate);

        if (!isNaN(timeSpentVal) && !isNaN(remainingVal)) {
            onLogWork(timeSpentVal, remainingVal);
            setIsLogWorkOpen(false);
            setLogTimeSpent('');
        }
    };

    return (
        <Box sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 1, p: 2, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="subtitle2" fontWeight="bold">Time tracking</Typography>
                </Box>
                <IconButton size="small" onClick={() => {
                    setIsLogWorkOpen(true);
                    setLogRemainingEstimate(remainingEstimate.toString());
                    setLogTimeSpent('');
                }}>
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

            {/* Stats */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                        {timeSpent}h
                    </Typography>
                    <Typography variant="caption" color="text.secondary">logged</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" color="text.primary" fontWeight="bold">
                        {remainingEstimate}h
                    </Typography>
                    <Typography variant="caption" color="text.secondary">remaining</Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="caption" color="text.secondary">{Math.round(progress)}% complete</Typography>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    onClick={() => {
                        const newEst = prompt("Update Original Estimate (hours):", originalEstimate.toString());
                        if (newEst !== null && !isNaN(parseFloat(newEst))) {
                            onUpdateOriginalEstimate(parseFloat(newEst));
                        }
                    }}
                >
                    {originalEstimate}h estimated
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
            <Dialog open={isLogWorkOpen} onClose={() => setIsLogWorkOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Log Work</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Time Spent (hours)"
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
                        />
                        <TextField
                            label="Remaining Estimate (hours)"
                            type="number"
                            value={logRemainingEstimate}
                            onChange={(e) => setLogRemainingEstimate(e.target.value)}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsLogWorkOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleLogWork} disabled={!logTimeSpent}>Log</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
