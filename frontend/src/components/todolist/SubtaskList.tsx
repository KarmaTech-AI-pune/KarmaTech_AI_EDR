import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  LinearProgress,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Add,
  ExpandMore,
  ExpandLess,
  Check,
  Close,
} from '@mui/icons-material';
import { Issue, Subtask, NewSubtaskFormState } from '../../types/todolist';
import { SubtaskItem } from './SubtaskItem';

interface SubtaskListProps {
  issue: Issue;
  onUpdateIssue: (issueId: string, updates: Partial<Issue>) => void;
  onCreateSubtask: (parentIssueId: string, subtaskData: NewSubtaskFormState) => void;
  onUpdateSubtask: (subtaskId: string, updates: Partial<Subtask>) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onSubtaskClick?: (subtask: Subtask) => void;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  issue,
  onUpdateIssue,
  onCreateSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onSubtaskClick,
}) => {
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [newSubtaskSummary, setNewSubtaskSummary] = useState('');

  const completedSubtasks = issue.subtasks.filter(subtask => subtask.status === 'Done').length;
  const totalSubtasks = issue.subtasks.length;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleToggleExpanded = () => {
    onUpdateIssue(issue.id, { isExpanded: !issue.isExpanded });
  };

  const handleCreateSubtask = () => {
    if (!newSubtaskSummary.trim()) return;

    const subtaskData: NewSubtaskFormState = {
      summary: newSubtaskSummary,
      assignee: '',
      priority: 'Medium',
    };

    onCreateSubtask(issue.id, subtaskData);
    setNewSubtaskSummary('');
    setIsCreatingSubtask(false);
  };

  const handleCancelCreate = () => {
    setNewSubtaskSummary('');
    setIsCreatingSubtask(false);
  };

  if (totalSubtasks === 0 && !isCreatingSubtask) {
    return (
      <Box sx={{ mt: 1 }}>
        <Button
          startIcon={<Add />}
          onClick={() => setIsCreatingSubtask(true)}
          size="small"
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          Create subtask
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      {/* Subtask Header with Progress */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          py: 0.5,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          borderRadius: 1,
        }}
        onClick={handleToggleExpanded}
      >
        <IconButton size="small" sx={{ p: 0.5 }}>
          {issue.isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>

        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
          Subtasks ({completedSubtasks}/{totalSubtasks})
        </Typography>

        <Box sx={{ flex: 1, mx: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: progressPercentage === 100 ? 'success.main' : 'primary.main',
                borderRadius: 3,
              },
            }}
          />
        </Box>

        <Typography variant="caption" color="text.secondary">
          {Math.round(progressPercentage)}%
        </Typography>
      </Box>

      {/* Subtasks List */}
      <Collapse in={issue.isExpanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 1 }}>
          {/* Column Headers */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
              alignItems: 'center',
              py: 0.5,
              px: 1,
              bgcolor: 'grey.200',
              borderRadius: 1,
              mb: 1,
            }}
          >
            <Typography variant="caption" fontWeight="medium" color="text.secondary">Work</Typography>
            <Typography variant="caption" fontWeight="medium" color="text.secondary">Priority</Typography>
            <Typography variant="caption" fontWeight="medium" color="text.secondary">Assignee</Typography>
            <Typography variant="caption" fontWeight="medium" color="text.secondary">Status</Typography>
            <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ textAlign: 'right' }}>
              Actions
            </Typography>
          </Box>

          {issue.subtasks.map((subtask, index) => (
            <React.Fragment key={subtask.id}>
              <SubtaskItem
                subtask={subtask}
                onUpdateSubtask={onUpdateSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onSubtaskClick={onSubtaskClick}
              />
              {index < issue.subtasks.length - 1 && (
                <Divider sx={{ gridColumn: '1/-1', my: 0.5 }} />
              )}
            </React.Fragment>
          ))}

          {/* Create New Subtask */}
          <Box sx={{ mt: 1 }}>
            {isCreatingSubtask ? (
              <Box sx={{ py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    value={newSubtaskSummary}
                    onChange={(e) => setNewSubtaskSummary(e.target.value)}
                    placeholder="What needs to be done?"
                    size="small"
                    fullWidth
                    variant="outlined"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateSubtask();
                      } else if (e.key === 'Escape') {
                        handleCancelCreate();
                      }
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleCreateSubtask}
                    disabled={!newSubtaskSummary.trim()}
                    sx={{ color: 'success.main' }}
                  >
                    <Check />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleCancelCreate}
                    sx={{ color: 'error.main' }}
                  >
                    <Close />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <Button
                startIcon={<Add />}
                onClick={() => setIsCreatingSubtask(true)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                Create subtask
              </Button>
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};
