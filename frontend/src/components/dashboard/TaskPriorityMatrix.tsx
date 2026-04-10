import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { TaskPriorityItemDto } from '../../services/dashboardService';

interface TaskPriorityMatrixProps {
  tasks: TaskPriorityItemDto[];
  onTaskClick?: (taskId: string) => void;
}

const TaskPriorityMatrix: React.FC<TaskPriorityMatrixProps> = ({ tasks }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getCategoryStyles = (category: TaskPriorityItemDto['category']) => {
    switch (category) {
      case 'urgent_important':
      return {
          backgroundColor: '#f5e9e8ff',
          borderColor: theme.palette.error.main,
          color: theme.palette.error.dark
        };
      case 'important_not_urgent':
        return {
          backgroundColor: '#e8f5e8',
          borderColor: theme.palette.success.main,
          color: theme.palette.success.dark
        };
      case 'urgent_not_important':
        return {
          backgroundColor: '#f8ebdbff',
          borderColor: theme.palette.warning.main,
          color: theme.palette.warning.dark
        };
      case 'neither':
        return {
          backgroundColor: theme.palette.grey[100],
          borderColor: theme.palette.grey[400],
          color: theme.palette.grey[700]
        };
      default:
        return {};
    }
  };

  const renderTasks = (category: TaskPriorityItemDto['category']) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 0.5 : 1 }}>
      {tasks
        .filter((task) => task.category === category)
        .map((task) => (
          <Box key={task.id} sx={{ p: isMobile ? 1 : 1.5, backgroundColor: theme.palette.background.paper, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: isMobile ? '0.75rem' : '0.85rem', mb: 0.5, lineHeight: 1.2 }}>
              {task.title}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
               <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 500, fontSize: isMobile ? '0.65rem' : '0.7rem' }}>
                 {task.project}
               </Typography>
               <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.65rem' : '0.7rem' }}>
                 User: {task.assignee}
               </Typography>
            </Box>
          </Box>
        ))}
    </Box>
  );

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Typography 
          variant="h6" 
          fontWeight="semibold" 
          sx={{ 
            mb: isMobile ? 2 : 3,
            fontSize: isMobile ? '1.1rem' : '1.25rem',
            lineHeight: isMobile ? 1.3 : 1.2
          }}
        >
          Task Priority Matrix
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 1.5 : 2, height: 'auto' }}>
          {/* Urgent & Important */}
          <Box 
            sx={{ 
              p: isMobile ? 1.5 : 2, 
              border: `2px solid ${getCategoryStyles('urgent_important').borderColor}`, 
              backgroundColor: getCategoryStyles('urgent_important').backgroundColor, 
              borderRadius: 2 
            }}
          >
            <Typography 
              variant="subtitle2" 
              fontWeight="semibold" 
              sx={{ 
                mb: isMobile ? 1 : 1.5, 
                color: getCategoryStyles('urgent_important').color,
                fontSize: isMobile ? '0.8rem' : '0.875rem'
              }}
            >
              Urgent & Important
            </Typography>
            {renderTasks('urgent_important')}
          </Box>

          {/* Important & Not Urgent */}
          <Box 
            sx={{ 
              p: isMobile ? 1.5 : 2, 
              border: `2px solid ${getCategoryStyles('important_not_urgent').borderColor}`, 
              backgroundColor: getCategoryStyles('important_not_urgent').backgroundColor, 
              borderRadius: 2 
            }}
          >
            <Typography 
              variant="subtitle2" 
              fontWeight="semibold" 
              sx={{ 
                mb: isMobile ? 1 : 1.5, 
                color: getCategoryStyles('important_not_urgent').color,
                fontSize: isMobile ? '0.8rem' : '0.875rem'
              }}
            >
              Important & Not Urgent
            </Typography>
            {renderTasks('important_not_urgent')}
          </Box>

          {/* Urgent & Not Important */}
          <Box 
            sx={{ 
              p: isMobile ? 1.5 : 2, 
              border: `2px solid ${getCategoryStyles('urgent_not_important').borderColor}`, 
              backgroundColor: getCategoryStyles('urgent_not_important').backgroundColor, 
              borderRadius: 2 
            }}
          >
            <Typography 
              variant="subtitle2" 
              fontWeight="semibold" 
              sx={{ 
                mb: isMobile ? 1 : 1.5, 
                color: getCategoryStyles('urgent_not_important').color,
                fontSize: isMobile ? '0.8rem' : '0.875rem'
              }}
            >
              Urgent & Not Important
            </Typography>
            {renderTasks('urgent_not_important')}
          </Box>

          {/* Neither Urgent nor Important */}
          <Box 
            sx={{ 
              p: isMobile ? 1.5 : 2, 
              border: `2px solid ${getCategoryStyles('neither').borderColor}`, 
              backgroundColor: getCategoryStyles('neither').backgroundColor, 
              borderRadius: 2 
            }}
          >
            <Typography 
              variant="subtitle2" 
              fontWeight="semibold" 
              sx={{ 
                mb: isMobile ? 1 : 1.5, 
                color: getCategoryStyles('neither').color,
                fontSize: isMobile ? '0.8rem' : '0.875rem'
              }}
            >
              Neither Urgent nor Important
            </Typography>
            {renderTasks('neither')}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskPriorityMatrix;
