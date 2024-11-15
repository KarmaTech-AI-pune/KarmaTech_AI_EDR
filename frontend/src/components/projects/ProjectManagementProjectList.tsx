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

interface ProjectManagementProjectListProps {
  projects: Project[];
  onCreateProject?: () => void;
  onProjectDeleted?: (projectId: number) => void;
  onProjectUpdated?: () => void;
}

export const ProjectManagementProjectList: React.FC<ProjectManagementProjectListProps> = ({ 
  projects, 
  onCreateProject,
  onProjectDeleted, 
  onProjectUpdated 
}) => {
  // Filter for active management projects
  const activeProjects = projects.filter(project => 
    [ProjectStatus['Bid Accepted'], ProjectStatus['Bid Submitted'], ProjectStatus['In Progress']].includes(project.status)
  );

  if (activeProjects.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#004a7f' }}>
          Active Projects
        </Typography>
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="200px"
        >
          <Typography variant="body1" sx={{ mb: 2 }}>
            No active projects found
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {onCreateProject && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={onCreateProject}
              >
                Create New Project
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ color: '#004a7f' }}>
          Active Projects
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {onCreateProject && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onCreateProject}
            >
              Create New Project
            </Button>
          )}
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
 
      <List>
        {activeProjects.map(project => (
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
