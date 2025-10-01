import React from 'react';
import { Book, CheckCircle, BugReport, Adjust, CropDin, SubdirectoryArrowRight } from '@mui/icons-material';
import { Issue, Subtask } from '../../../types/todolist';

interface IssueTypeIconProps {
  issueType: Issue['issueType'] | Subtask['issueType'];
  size?: 'small' | 'medium';
}

export const IssueTypeIcon: React.FC<IssueTypeIconProps> = ({ issueType, size = 'medium' }) => {
  const iconSize = size === 'small' ? 14 : 16;
  
  switch (issueType) {
    case 'Story': return <Book sx={{ width: iconSize, height: iconSize, color: 'success.main' }} />;
    case 'Task': return <CheckCircle sx={{ width: iconSize, height: iconSize, color: 'info.main' }} />;
    case 'Bug': return <BugReport sx={{ width: iconSize, height: iconSize, color: 'error.main' }} />;
    case 'Epic': return <Adjust sx={{ width: iconSize, height: iconSize, color: 'secondary.main' }} />;
    case 'Sub-task': return <SubdirectoryArrowRight sx={{ width: iconSize, height: iconSize, color: 'primary.main' }} />;
    default: return <CropDin sx={{ width: iconSize, height: iconSize, color: 'text.secondary' }} />;
  }
};
