
/*
import React from 'react';
import { 
  Typography, 
  Paper, 
  List,
  Box,
  Divider
} from '@mui/material';
import { ProjectItem } from './ProjectItem';
import { Project, ProjectStatus } from '../../types';

interface ProjectListProps {
  projects?: Project[];
  pageType?: 'business-development' | 'project-management';
  title?: string;
  onProjectDeleted?: (projectId: number) => void;
  onProjectUpdated?: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ 
  projects = [], 
  pageType,
  title = 'Projects', 
  onProjectDeleted, 
  onProjectUpdated 
}) => {
  // Filter projects based on pageType if specified
  const filteredProjects = pageType 
    ? projects.filter(project => {
        if (pageType === 'project-management') {
          return [
            ProjectStatus['Bid Accepted'], 
            ProjectStatus['Bid Submitted'], 
            ProjectStatus['In Progress']
          ].includes(project.status);
        } else if (pageType === 'business-development') {
          return ![
            ProjectStatus['Bid Accepted'], 
            ProjectStatus['Bid Submitted'], 
            ProjectStatus['In Progress']
          ].includes(project.status);
        }
        return true;
      })
    : projects;

  if (filteredProjects.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#004a7f' }}>
          {title}
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography variant="body1">No projects found</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#004a7f' }}>
        {title}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
 
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
    </Paper>
  );
};
*/