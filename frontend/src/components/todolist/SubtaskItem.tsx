import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Check,
  Close,
} from '@mui/icons-material';
import { Subtask, TeamMember } from '../../types/todolist';
import { IssueTypeIcon } from './common/IssueTypeIcon';
import { PriorityIcon } from './common/PriorityIcon';

interface SubtaskItemProps {
  subtask: Subtask;
  teamMembers: TeamMember[];
  onUpdateSubtask: (subtaskId: string, updates: Partial<Subtask>) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onSubtaskClick?: (subtask: Subtask) => void;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  teamMembers,
  onUpdateSubtask,
  onDeleteSubtask,
  onSubtaskClick,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingSummary, setEditingSummary] = useState(subtask.summary);
  const [editingStatus, setEditingStatus] = useState(subtask.status);
  const [editingAssignee, setEditingAssignee] = useState(subtask.assignee?.id || '');

  const statusOptions = [
    { value: 'To Do', label: 'To Do', color: '#DFE1E6' },
    { value: 'In Progress', label: 'In Progress', color: '#0065FF' },
    { value: 'Review', label: 'Review', color: '#FF991F' },
    { value: 'Done', label: 'Done', color: '#36B37E' },
  ];

  const handleSave = () => {
    const assignedMember = teamMembers.find(member => member.id === editingAssignee);
    onUpdateSubtask(subtask.id, {
      summary: editingSummary,
      status: editingStatus as Subtask['status'],
      assignee: assignedMember || null,
      updatedDate: new Date().toISOString().split('T')[0],
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingSummary(subtask.summary);
    setEditingStatus(subtask.status);
    setEditingAssignee(subtask.assignee?.id || '');
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this subtask?')) {
      onDeleteSubtask(subtask.id);
    }
  };

  const statusColor = statusOptions.find(opt => opt.value === subtask.status)?.color || '#DFE1E6';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr auto', // Work, Priority, Assignee, Status, Actions (Adjusted for explicit actions column)
        alignItems: 'center',
        py: 0.5,
        px: 1,
        backgroundColor: 'grey.50',
        borderRadius: 1,
        cursor: onSubtaskClick ? 'pointer' : 'default',
        '&:hover': {
          backgroundColor: 'grey.100',
          '& .subtask-actions': {
            opacity: 1,
          },
        },
        transition: 'background-color 0.2s ease',
      }}
      onClick={() => !isEditing && onSubtaskClick?.(subtask)}
    >
      {/* Work Column */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IssueTypeIcon issueType="Sub-task" size="small" />
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 'medium',
            minWidth: 'fit-content',
          }}
        >
          {subtask.key}
        </Typography>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <TextField
              value={editingSummary}
              onChange={(e) => setEditingSummary(e.target.value)}
              size="small"
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.875rem',
                },
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{
                textDecoration: subtask.status === 'Done' ? 'line-through' : 'none',
                color: subtask.status === 'Done' ? 'text.secondary' : 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {subtask.summary}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Priority Column */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <PriorityIcon priority={subtask.priority} size="small" />
        <Typography variant="body2">{subtask.priority}</Typography>
      </Box>

      {/* Assignee Column */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isEditing ? (
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={editingAssignee}
              onChange={(e) => setEditingAssignee(e.target.value)}
              displayEmpty
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {teamMembers.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 20,
                        height: 20,
                        fontSize: '0.75rem',
                        bgcolor: 'primary.main',
                      }}
                    >
                      {member.avatar}
                    </Avatar>
                    {member.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          subtask.assignee ? (
            <Tooltip title={subtask.assignee.name}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: '0.75rem',
                    bgcolor: 'primary.main',
                    color: 'white',
                  }}
                >
                  {subtask.assignee.avatar}
                </Avatar>
                <Typography variant="body2">{subtask.assignee.name}</Typography>
              </Box>
            </Tooltip>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Unassigned
            </Typography>
          )
        )}
      </Box>

      {/* Status Column */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {isEditing ? (
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={editingStatus}
              onChange={(e) => setEditingStatus(e.target.value as Subtask['status'])}
              onClick={(e) => e.stopPropagation()}
              sx={{
                backgroundColor: statusOptions.find(opt => opt.value === editingStatus)?.color,
                color: editingStatus === 'Done' ? 'white' : 'text.primary',
                '& .MuiSelect-select': {
                  padding: '4px 8px',
                  minHeight: 'unset',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
        <Box sx={{ display: 'flex', alignItems: "center" }}>
          <Chip
            label={subtask.status}
            size="small"
            sx={{
              backgroundColor: statusColor,
              color: subtask.status === 'Done' ? 'white' : 'text.primary',
              fontWeight: 'medium',
              fontSize: '0.75rem',
              height: 20,
              minWidth: 'fit-content',
            }}
          />

          <Box
        sx={{
          // display: 'flex',
          // alignItems: 'center',
          gap: 0.5,
          // opacity: 0, // Hidden by default, shown on hover
          // transition: 'opacity 0.2s ease',
          justifyItems: "flex-end"
        }}
      >
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{ color: 'error.main' }}
            >
              <Delete fontSize="small" />
            </IconButton>
      </Box>
      </Box>
        )}
      </Box>
    </Box>
  );
};
