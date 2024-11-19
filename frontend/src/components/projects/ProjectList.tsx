import React from 'react';
import { 
  Typography, 
  Paper, 
  List,
  Box,
  Divider,
  Button
} from '@mui/material';
import { ProjectItem } from './ProjectItem';
import { Project, ProjectStatus } from '../../types';

export interface GeneralProjectListProps {
  projects: Project[];
  title?: string;
  emptyMessage?: string;
  actionLabel?: string;
  onCreateAction?: () => void;
  onProjectDeleted?: (projectId: number) => void;
  onProjectUpdated?: () => void;
  filterStatuses?: ProjectStatus[];
}

export const GeneralProjectList: React.FC<GeneralProjectListProps> = ({ 
  projects, 
  emptyMessage = 'No projects found',
  onProjectDeleted,
  onProjectUpdated,
  filterStatuses
}) => {
  // Filter projects based on provided statuses
  const filteredProjects = filterStatuses 
    ? projects.filter(project => filterStatuses.includes(project.status))
    : projects;

  if (filteredProjects.length === 0) {
    return (
    
        <Box >
          <Typography variant="body1" sx={{ mb: 2 }}>
            {emptyMessage}
          </Typography>
        
        </Box>
    );
  }

  return (
      <Box>
        
       
 <List>
   {filteredProjects.map(project => (
     <ProjectItem 
       key={project.id} 
       project={project} 
       onProjectDeleted={onProjectDeleted}
       onProjectUpdated={onProjectUpdated}
     />
   ))}
 </List>
      </Box>
   
  );
};
