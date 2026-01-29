import React, { useState } from 'react';
import { Typography, TextField, InputAdornment, Chip, Box, IconButton, Avatar, AvatarGroup, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { SprintEmployee } from '../../data/todolistData';

interface TodolistHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  quickFilters: { [key: string]: boolean };
  setQuickFilters: React.Dispatch<React.SetStateAction<{ 'Only My Issues': boolean; 'Recently Updated': boolean; 'Done Issues': boolean; }>>;
  setShowCreateModal: (show: boolean) => void;
  sprintEmployees?: SprintEmployee[];
  onCompleteSprint?: () => void;
}

export const TodolistHeader: React.FC<TodolistHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  quickFilters,
  setQuickFilters,
  setShowCreateModal,
  sprintEmployees = [],
  onCompleteSprint,
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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"  >
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

      {/* Complete Sprint Button */}
      {onCompleteSprint && (
        <Button
          variant="contained"
          color="inherit"
          size="small"
          onClick={handleCompleteClick}
          sx={{ ml: 2, bgcolor: '#f4f5f7', color: '#42526e', '&:hover': { bgcolor: '#ebecf0' } }}
        >
          Complete Sprint
        </Button>
      )}

      <Box sx={{ ml: 'auto' }}>
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
