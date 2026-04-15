import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  Divider,
} from '@mui/material';
import { TaskPriorityItemDto } from '../../services/dashboardService';

interface TaskPriorityMatrixProps {
  tasks: TaskPriorityItemDto[];
  onTaskClick?: (taskId: string) => void;
}

const TaskPriorityMatrix: React.FC<TaskPriorityMatrixProps> = ({ tasks, onTaskClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTaskGroup, setSelectedTaskGroup] = useState<TaskPriorityItemDto[]>([]);
  const [selectedTitle, setSelectedTitle] = useState('');

  // Group tasks by category and then by title
  const groupedTasks = useMemo(() => {
    const categories: Record<string, Record<string, TaskPriorityItemDto[]>> = {
      urgent_important: {},
      important_not_urgent: {},
      urgent_not_important: {},
      neither: {}
    };

    tasks.forEach(task => {
      if (!categories[task.category][task.title]) {
        categories[task.category][task.title] = [];
      }
      categories[task.category][task.title].push(task);
    });

    return categories;
  }, [tasks]);

  const handleTaskClick = (title: string, taskGroup: TaskPriorityItemDto[]) => {
    setSelectedTitle(title);
    setSelectedTaskGroup(taskGroup);
    setDialogOpen(true);
    
    // If there's only one task and onTaskClick is provided, call it
    if (taskGroup.length === 1 && onTaskClick) {
      onTaskClick(taskGroup[0].id.toString());
    }
  };

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

  const renderTasks = (category: TaskPriorityItemDto['category']) => {
    const categoryGroups = groupedTasks[category] || {};
    const titles = Object.keys(categoryGroups);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 0.5 : 1 }}>
        {titles.map((title) => {
          const group = categoryGroups[title];
          const isMultiple = group.length > 1;
          const firstTask = group[0];

          return (
            <Box 
              key={`${category}-${title}`} 
              onClick={() => handleTaskClick(title, group)}
              sx={{ 
                p: isMobile ? 1 : 1.5, 
                backgroundColor: theme.palette.background.paper, 
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[2],
                  backgroundColor: theme.palette.action.hover
                },
                border: isMultiple ? `1px dashed ${theme.palette.primary.main}` : 'none'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: isMobile ? '0.75rem' : '0.85rem', mb: 0.5, lineHeight: 1.2 }}>
                {title}
              </Typography>
              
              {isMultiple ? (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                    {group.length} Tasks Combined
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem', fontStyle: 'italic' }}>
                    Click to view details
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 500, fontSize: isMobile ? '0.65rem' : '0.7rem' }}>
                    {firstTask.project}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.65rem' : '0.7rem' }}>
                    User: {firstTask.assignee}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

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

        {/* Task Details Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {selectedTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedTaskGroup.length} task(s) in this group
            </Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 0 }}>
            <List sx={{ p: 0 }}>
              {Array.from(
                selectedTaskGroup.reduce((acc, task) => {
                  const key = `${task.project}-${task.assignee}`;
                  if (!acc.has(key)) {
                    acc.set(key, { ...task, ids: [task.id] });
                  } else {
                    acc.get(key).ids.push(task.id);
                  }
                  return acc;
                }, new Map()).values()
              ).map((groupTask: any, index, array) => (
                <React.Fragment key={`${groupTask.project}-${groupTask.assignee}`}>
                  <ListItem sx={{ py: 2, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                       <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                         Project: {groupTask.project}
                       </Typography>
                       <Typography variant="caption" sx={{ bgcolor: theme.palette.grey[100], px: 1, borderRadius: 1, py: 0.5 }}>
                         {groupTask.ids.length > 1 ? `IDs: ${groupTask.ids.join(', ')}` : `ID: ${groupTask.id}`}
                       </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Assigned to: <strong>{groupTask.assignee}</strong>
                    </Typography>
                  </ListItem>
                  {index < array.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogOpen(false)} variant="contained" sx={{ borderRadius: 1 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TaskPriorityMatrix;
