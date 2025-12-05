import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useProjectDetailsContext } from './ProjectDetails';
import { ProjectBudgetHistory as ProjectBudgetHistoryComponent } from '../../components/project/ProjectBudgetHistory';

const ProjectBudgetHistoryPage: React.FC = () => {
  const { project } = useProjectDetailsContext();

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Budget Change History
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Track all changes to project budget (Estimated Project Cost and Estimated Project Fee)
        </Typography>
        <ProjectBudgetHistoryComponent projectId={parseInt(project.id)} />
      </Paper>
    </Box>
  );
};

export default ProjectBudgetHistoryPage;
