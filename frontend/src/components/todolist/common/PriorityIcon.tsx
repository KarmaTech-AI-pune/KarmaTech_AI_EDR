import React from 'react';
import { ArrowUpward, ArrowDownward, Remove } from '@mui/icons-material';
import { Issue, Subtask } from '../../../types/todolist';

interface PriorityIconProps {
  priority: Issue['priority'] | Subtask['priority'];
  size?: 'small' | 'medium';
}

export const PriorityIcon: React.FC<PriorityIconProps> = ({ priority, size = 'medium' }) => {
  const iconSize = size === 'small' ? 14 : 16;
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Highest': return 'error.main';
      case 'High': return 'warning.main';
      case 'Medium': return 'info.main';
      case 'Low': return 'success.main';
      case 'Lowest': return 'text.secondary';
      default: return 'text.secondary';
    }
  };

  switch (priority) {
    case 'Highest': return <ArrowUpward sx={{ width: iconSize, height: iconSize, color: getPriorityColor(priority) }} />;
    case 'High': return <ArrowUpward sx={{ width: iconSize, height: iconSize, color: getPriorityColor(priority) }} />;
    case 'Medium': return <Remove sx={{ width: iconSize, height: iconSize, color: getPriorityColor(priority) }} />;
    case 'Low': return <ArrowDownward sx={{ width: iconSize, height: iconSize, color: getPriorityColor(priority) }} />;
    case 'Lowest': return <ArrowDownward sx={{ width: iconSize, height: iconSize, color: getPriorityColor(priority) }} />;
    default: return <Remove sx={{ width: iconSize, height: iconSize, color: getPriorityColor('default') }} />;
  }
};
