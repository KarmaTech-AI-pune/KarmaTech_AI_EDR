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

interface BusinessDevelopmentProjectListProps {
  projects: Project[];
  onCreateOpportunity?: () => void;
  onProjectDeleted?: (projectId: number) => void;
  onProjectUpdated?: () => void;
}

export const BusinessDevelopmentProjectList: React.FC<BusinessDevelopmentProjectListProps> = ({ 
  projects, 
  onCreateOpportunity,
  onProjectDeleted, 
  onProjectUpdated 
}) => {
  // Filter for business development projects (not in active management)
  const businessDevProjects = projects.filter(project => 
    ![ProjectStatus['Bid Accepted'], ProjectStatus['Bid Submitted'], ProjectStatus['In Progress']].includes(project.status)
  );

  if (businessDevProjects.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#004a7f' }}>
          Business Development Projects
        </Typography>
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="200px"
        >
          <Typography variant="body1" sx={{ mb: 2 }}>
            No business development projects found
          </Typography>
          {onCreateOpportunity && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onCreateOpportunity}
            >
              Create New Opportunity
            </Button>
          )}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ color: '#004a7f' }}>
          Business Development Projects
        </Typography>
        {onCreateOpportunity && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onCreateOpportunity}
          >
            Create New Opportunity
          </Button>
        )}
      </Box>
      
      <Divider sx={{ my: 2 }} />
 
      <List>
        {businessDevProjects.map(project => (
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
