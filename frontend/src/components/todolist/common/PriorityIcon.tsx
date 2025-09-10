import React from 'react';
import { ArrowUpward, ArrowDownward, Remove } from '@mui/icons-material';
import { Issue } from '../../../types/todolist';

interface PriorityIconProps {
  priority: Issue['priority'];
}

export const PriorityIcon: React.FC<PriorityIconProps> = ({ priority }) => {
  switch (priority) {
    case 'Highest': return <ArrowUpward sx={{ width: 16, height: 16 }} />;
    case 'High': return <ArrowUpward sx={{ width: 16, height: 16,  }} />;
    case 'Medium': return <ArrowUpward sx={{ width: 16, height: 16,  }} />;
    case 'Low': return <ArrowDownward sx={{ width: 16, height: 16,  }} />;
    case 'Lowest': return <ArrowDownward sx={{ width: 16, height: 16,  }} />;
    default: return <Remove sx={{ width: 16, height: 16,  }} />;
  }
};
