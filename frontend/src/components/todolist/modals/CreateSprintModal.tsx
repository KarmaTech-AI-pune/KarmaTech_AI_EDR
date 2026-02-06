import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, Grid, Box, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';
import { SprintPlanInputDto, createSprintPlanAPI } from '../../../data/todolistData';

interface CreateSprintModalProps {
    showCreateModal: boolean;
    setShowCreateModal: (show: boolean) => void;
    onSprintCreated: (sprintId: number) => void;
    projectId: number; // Need project ID to create sprint
}

export const CreateSprintModal: React.FC<CreateSprintModalProps> = ({
    showCreateModal,
    setShowCreateModal,
    onSprintCreated,
    projectId
}) => {
    const [sprintName, setSprintName] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Default 1 week
    const [sprintGoal, setSprintGoal] = useState('');
    const [plannedStoryPoints, setPlannedStoryPoints] = useState<string>('');
    const [actualStoryPoints, setActualStoryPoints] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        setShowCreateModal(false);
        // Reset form on close? Or keep state? typically reset is better
        setSprintName('');
        setSprintGoal('');
        setPlannedStoryPoints('');
        setActualStoryPoints('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    };

    const handleCreate = async () => {
        if (!sprintName.trim() || !startDate || !endDate) return;

        setIsSubmitting(true);
        try {
            const newSprint: SprintPlanInputDto = {
                ProjectId: projectId,
                SprintName: sprintName,
                StartDate: startDate,
                EndDate: endDate,
                SprintGoal: sprintGoal,
                RequiredSprintEmployees: 0,

                PlannedStoryPoints: parseInt(plannedStoryPoints) || 0,
                ActualStoryPoints: parseInt(actualStoryPoints) || 0,
                Velocity: 0,
                Status: 0, // Not Started
                CreatedAt: new Date().toISOString()
            };

            const createdSprintId = await createSprintPlanAPI(newSprint);
            onSprintCreated(createdSprintId);
            handleClose();
        } catch (error) {
            console.error("Failed to create sprint:", error);
            alert("Failed to create sprint. Please check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={showCreateModal} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Create New Sprint</Typography>
                <Button color="inherit" onClick={handleClose}>
                    <Close />
                </Button>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
                <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2 } }}>
                    <TextField
                        fullWidth
                        label="Sprint Name *"
                        value={sprintName}
                        onChange={(e) => setSprintName(e.target.value)}
                        placeholder="e.g. Sprint 1"
                        margin="normal"
                        required
                        autoFocus
                    />

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Start Date *"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="End Date *"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Planned Story Points"
                                type="number"
                                value={plannedStoryPoints}
                                onChange={(e) => setPlannedStoryPoints(e.target.value)}
                                placeholder="0"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Actual Story Points"
                                type="number"
                                value={actualStoryPoints}
                                onChange={(e) => setActualStoryPoints(e.target.value)}
                                placeholder="0"
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        fullWidth
                        label="Sprint Goal"
                        multiline
                        rows={4}
                        value={sprintGoal}
                        onChange={(e) => setSprintGoal(e.target.value)}
                        placeholder="What is the goal of this sprint?"
                        margin="normal"
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleCreate}
                    disabled={!sprintName.trim() || isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
