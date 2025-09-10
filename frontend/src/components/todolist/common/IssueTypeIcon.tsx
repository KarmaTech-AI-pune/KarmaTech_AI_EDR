import React from 'react';
import { Book, CheckCircle, BugReport, Adjust, CropDin } from '@mui/icons-material';
import { Issue } from '../../../types/todolist';

interface IssueTypeIconProps {
  issueType: Issue['issueType'];
}

export const IssueTypeIcon: React.FC<IssueTypeIconProps> = ({ issueType }) => {
  switch (issueType) {
    case 'Story': return <Book sx={{ width: 16, height: 16, color: 'success.main' }} />;
    case 'Task': return <CheckCircle sx={{ width: 16, height: 16, color: 'info.main' }} />;
    case 'Bug': return <BugReport sx={{ width: 16, height: 16, color: 'error.main' }} />;
    case 'Epic': return <Adjust sx={{ width: 16, height: 16, color: 'secondary.main' }} />;
    default: return <CropDin sx={{ width: 16, height: 16, color: 'text.secondary' }} />;
  }
};
