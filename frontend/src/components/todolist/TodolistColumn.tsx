import React from 'react';
import { Box, Typography, Divider, IconButton } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import { Droppable } from '@hello-pangea/dnd';
import { Issue } from '../../types/todolist';
import { IssueCard } from './IssueCard';

interface TodolistColumnProps {
  id: Issue['status'];
  title: string;
  color: string;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onToggleFlag: (issueId: string) => void;
  setShowCreateModal: (show: boolean) => void;
}

export const TodolistColumn: React.FC<TodolistColumnProps> = ({
  id,
  title,
  color,
  issues,
  onIssueClick,
  onToggleFlag,
}) => {
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.droppableProps}
          sx={{
            flexShrink: 0,
            width: 265,
            p: 1,
            bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'grey.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.200',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '80vh',
            transition: 'background-color 0.2s ease',
            pointerEvents: 'auto', // Ensure no overlay blocks interactions
          }}
        >
          {/* Column Header */}
          <Box sx={{ mb: 2, flexShrink: 0 }}>
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

          {/* Issues Area */}
          <Box
            sx={{
              flexGrow: 1,
              minHeight: issues.length === 0 ? 300 : 100,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {issues.map((issue, index) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                index={index}
                onClick={onIssueClick}
                onToggleFlag={onToggleFlag}
              />
            ))}
            {provided.placeholder}


          </Box>
        </Box>
      )}
    </Droppable>
  );
};
