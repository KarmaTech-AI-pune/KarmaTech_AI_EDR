import React from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress, Avatar, IconButton } from '@mui/material';
import { AttachFile, Message, MoreHoriz, Flag } from '@mui/icons-material';
import { Issue } from '../../types/todolist';
import { IssueTypeIcon } from './common/IssueTypeIcon';
import { PriorityIcon } from './common/PriorityIcon';

interface IssueCardProps {
  issue: Issue;
  onClick: (issue: Issue) => void;
  onToggleFlag: (issueId: string) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick, onToggleFlag }) => {
  return (
    <Card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', issue.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={() => onClick(issue)}
      sx={{
        cursor: 'pointer',
        '&:hover': { boxShadow: 3 },
        transition: 'box-shadow 0.3s ease-in-out',
        mb: 1.5,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
            <IssueTypeIcon issueType={issue.issueType} />
            <Typography variant="body2" fontWeight="medium">{issue.key}</Typography>
            {issue.flagged && (
              <Flag
                sx={{ width: 12, height: 12, color: 'red', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFlag(issue.id);
                }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PriorityIcon priority={issue.priority} />
            <IconButton size="small" sx={{ opacity: 0, '&:hover': { opacity: 1 } }} onClick={(e) => e.stopPropagation()}>
              <MoreHoriz fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1, lineHeight: 'tight' }}>
          {issue.summary}
        </Typography>

        {issue.subtasks > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'text.secondary', mb: 0.5 }}>
              <Typography variant="caption">Subtasks</Typography>
              <Typography variant="caption">{issue.completedSubtasks}/{issue.subtasks}</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(issue.completedSubtasks / issue.subtasks) * 100}
              sx={{ height: 4, borderRadius: 2, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'success.main' } }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'grey.100' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {issue.storyPoints > 0 && (
              <Avatar sx={{ width: 20, height: 20, bgcolor: 'grey.100', color: 'grey.600', fontSize: '0.75rem', fontWeight: 'medium' }}>
                {issue.storyPoints}
              </Avatar>
            )}

            {issue.attachments > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                <AttachFile sx={{ width: 12, height: 12 }} />
                <Typography variant="caption">{issue.attachments}</Typography>
              </Box>
            )}

            {issue.comments > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                <Message sx={{ width: 12, height: 12 }} />
                <Typography variant="caption">{issue.comments}</Typography>
              </Box>
            )}
          </Box>

          {issue.assignee && (
            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', color: 'white', fontSize: '0.75rem', fontWeight: 'medium', cursor: 'pointer' }} title={issue.assignee.name}>
              {issue.assignee.avatar}
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
