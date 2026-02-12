import React, { useState } from 'react';
import { Typography, TextField, InputAdornment, Chip, Box, IconButton, Avatar, AvatarGroup, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Search, Add } from '@mui/icons-material';
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
}) => {
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleCompleteClick = () => {
    setOpenConfirm(true);
  };

  const handleConfirmComplete = () => {
    if (onCompleteSprint) {
      onCompleteSprint();
    }
    setOpenConfirm(false);
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
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            <strong>Sprint Name:</strong> {sprintPlan.sprintName}
          </Typography>
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
    </Box>
  );
};
