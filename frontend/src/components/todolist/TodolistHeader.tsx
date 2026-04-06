import React, { useState } from 'react';
import { Typography, TextField, InputAdornment, Chip, Box, IconButton, Avatar, AvatarGroup, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Search, Add, Edit } from '@mui/icons-material';
import { SprintEmployee, SprintPlanDto } from '../../data/todolistData';

interface TodolistHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  quickFilters: { [key: string]: boolean };
  setQuickFilters: React.Dispatch<React.SetStateAction<{ 'Only My Issues': boolean; 'Recently Updated': boolean; 'Done Issues': boolean; }>>;
  setShowCreateModal: (show: boolean) => void;
  sprintEmployees?: SprintEmployee[];
  sprintPlan?: SprintPlanDto | null;
  onCompleteSprint?: () => void;
  onCreateSprint?: () => void;
  onUpdateSprint?: (updatedPlan: Partial<SprintPlanDto>) => void | Promise<void>;
}

export const TodolistHeader: React.FC<TodolistHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  quickFilters,
  setQuickFilters,
  setShowCreateModal,
  sprintEmployees = [],
  sprintPlan,
  onCompleteSprint,
  onCreateSprint,
  onUpdateSprint,
}) => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openEditSprint, setOpenEditSprint] = useState(false);
  const [editSprintData, setEditSprintData] = useState<Partial<SprintPlanDto>>({});

  const handleCompleteClick = () => {
    setOpenConfirm(true);
  };

  const handleConfirmComplete = () => {
    if (onCompleteSprint) {
      onCompleteSprint();
    }
    setOpenConfirm(false);
  };

  const handleEditSprintClick = () => {
    if (sprintPlan) {
      setEditSprintData({
        sprintName: sprintPlan.sprintName,
        sprintGoal: sprintPlan.sprintGoal,
        startDate: new Date(sprintPlan.startDate).toISOString().split('T')[0],
        endDate: new Date(sprintPlan.endDate).toISOString().split('T')[0],
      });
      setOpenEditSprint(true);
    }
  };

  const handleSaveSprintEdit = () => {
    if (onUpdateSprint) {
      onUpdateSprint(editSprintData);
    }
    setOpenEditSprint(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {/* Sprint Info Row */}
      {sprintPlan && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {/* If Project Name were available, it would go here. 
               The user says "Project Name" is already available, implying it might be above this component 
               or I should look for it. For now, I'm placing the Sprint Info as the top block. 
               The user said: "The Sprint Details should appear under the Project Name and above the Search Tasks bar."
               So:
               [Project Name - presumably above or I need to add it if I find it]
               [Sprint Name]
               [Dates - Goal]
           */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              <strong>Sprint Name:</strong> {sprintPlan.sprintName}
            </Typography>
            {onUpdateSprint && (
              <IconButton size="small" onClick={handleEditSprintClick} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                <Edit fontSize="small" />
              </IconButton>
            )}
          </Box>
          {sprintPlan.sprintNumber !== undefined && (
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              <strong>Sprint Number:</strong> {sprintPlan.sprintNumber}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Sprint Date:</strong> {new Date(sprintPlan.startDate).toLocaleDateString()} – {new Date(sprintPlan.endDate).toLocaleDateString()}
            </Typography>
            {sprintPlan.sprintGoal && (
              <Chip
                label={`Goal: ${sprintPlan.sprintGoal}`}
                size="small"
                variant="outlined"
                sx={{ height: 24 }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Controls Row: Search, Filters, Team, Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {/* Search Bar */}
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 250 }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">Quick filters:</Typography>
          {Object.entries(quickFilters).map(([filter, active]) => (
            <Chip
              key={filter}
              label={filter}
              onClick={() => setQuickFilters(prevFilters => ({ ...prevFilters, [filter]: !active }))}
              color={active ? 'primary' : 'default'}
              variant={active ? 'filled' : 'outlined'}
              size="small"
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>

        {/* Sprint Employees */}
        {sprintEmployees.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <Typography variant="body2" color="text.secondary">Team:</Typography>
            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: 14 } }}>
              {sprintEmployees.map((emp) => (
                <Avatar key={emp.employeeId} alt={emp.employeeName} title={emp.employeeName}>
                  {emp.employeeName.charAt(0).toUpperCase()}
                </Avatar>
              ))}
            </AvatarGroup>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
          {onCompleteSprint && (
            <Button
              variant="contained"
              color="inherit"
              size="small"
              onClick={handleCompleteClick}
              sx={{ bgcolor: '#f4f5f7', color: '#42526e', '&:hover': { bgcolor: '#ebecf0' } }}
            >
              Complete Sprint
            </Button>
          )}

          {onCreateSprint && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={onCreateSprint}
            >
              Create New Sprint
            </Button>
          )}

          <IconButton
            color="primary"
            onClick={() => setShowCreateModal(true)}
            sx={{
              bgcolor: 'primary.light',
              color: 'primary.main',
              '&:hover': { bgcolor: 'primary.main', color: 'white' }
            }}
          >
            <Add />
          </IconButton>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Complete Sprint</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to complete this sprint? This will clear the board and load the next sprint.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={handleConfirmComplete} color="primary" autoFocus>
            Complete Sprint
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Sprint Dialog */}
      <Dialog open={openEditSprint} onClose={() => setOpenEditSprint(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Sprint</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Sprint Name"
            name="sprintName"
            value={editSprintData.sprintName || ''}
            onChange={(e) => setEditSprintData({ ...editSprintData, sprintName: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Sprint Goal"
            name="sprintGoal"
            value={editSprintData.sprintGoal || ''}
            onChange={(e) => setEditSprintData({ ...editSprintData, sprintGoal: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={editSprintData.startDate || ''}
              onChange={(e) => setEditSprintData({ ...editSprintData, startDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={editSprintData.endDate || ''}
              onChange={(e) => setEditSprintData({ ...editSprintData, endDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditSprint(false)}>Cancel</Button>
          <Button onClick={handleSaveSprintEdit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
