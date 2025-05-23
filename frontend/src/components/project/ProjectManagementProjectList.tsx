import React, { useState} from 'react';
import { 
  Typography, 
  List,
  Box,
} from '@mui/material';
import { ProjectItem } from './ProjectItem';
import { ProjectStatus } from '../../types/index';
import { Project} from '../../models';
import { ProjectInitializationDialog } from './ProjectInitializationDialog';

export interface ProjectManagementProjectListProps {
  projects: Project[];
  emptyMessage?: string;
  onProjectDeleted?: (projectId: string) => void;
  onProjectUpdated?: () => void;
  filterStatuses?: ProjectStatus[];
}

export const ProjectManagementProjectList: React.FC<ProjectManagementProjectListProps> = ({ 
  projects, 
  emptyMessage = 'No active projects found',
  onProjectDeleted,
  onProjectUpdated,
  
}) => {
  const [isInitializeDialogOpen, setIsInitializeDialogOpen] = useState(false);
 
  const handleCloseDialog = () => {
    setIsInitializeDialogOpen(false);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      overflow: 'visible'
    }}>
      <Box sx={{ 
        flexGrow: 1,
        width: '100%',
        overflow: 'visible'
      }}>
        {projects.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column"
            justifyContent="center" 
            alignItems="center" 
            minHeight="200px"
            width="100%"
          >
            <Typography variant="body1">
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          <List sx={{ 
            width: '100%',
            '& > *:not(:last-child)': {
              mb: 1
            }
          }}>
            {projects.map(project => (
              <ProjectItem 
                key={project.id} 
                project={project} 
                onProjectDeleted={onProjectDeleted}
                onProjectUpdated={onProjectUpdated}
              />
            ))}
          </List>
        )}
      </Box>

      <ProjectInitializationDialog 
        open={isInitializeDialogOpen} 
        onClose={handleCloseDialog} 
      />
    </Box>
  );
};

export default ProjectManagementProjectList;
