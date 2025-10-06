import React from 'react';
import { Box, Typography, Divider, IconButton } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import { Issue } from '../../types/todolist';
import { IssueCard } from './IssueCard';

interface TodolistColumnProps {
  id: Issue['status'];
  title: string;
  color: string;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onToggleFlag: (issueId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: Issue['status']) => void;
  setShowCreateModal: (show: boolean) => void;
}

export const TodolistColumn: React.FC<TodolistColumnProps> = ({
  id,
  title,
  color,
  issues,
  onIssueClick,
  onToggleFlag,
  onDrop,
}) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // const issueId = e.dataTransfer.getData('text/plain');
    onDrop(e, id); // Pass the event and column id to the parent handler
  };

  return (
    <Box
      sx={{
        flexShrink: 0,
        width: 265,
        p: 1,
        bgcolor: 'grey.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.200',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ bgcolor: 'grey.200', color: 'grey.600', px: 1, py: 0.5, borderRadius: '9999px', fontWeight: 'medium' }}>
              {issues.length}
            </Typography>
          </Box>
          <IconButton size="small" color="inherit">
            <MoreHoriz fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ bgcolor: color, height: 3, borderRadius: 1.5 }} />
      </Box>

      <Box sx={{ minHeight: 100 }}>
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={onIssueClick}
            onToggleFlag={onToggleFlag}
          />
        ))}
      </Box>
    </Box>
  );
};
