import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import ProjectClosureList from '../components/projects/projectClosure/ProjectClosureList';

export const ProjectClosure: React.FC = () => {
  return (
    <Box sx={{ mt: '64px' }}>  {/* Added top margin to account for fixed navbar */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Project Closure Forms
        </Typography>
        <Typography variant="body1" paragraph>
          View and manage project closure forms for your projects.
        </Typography>
        <ProjectClosureList />
      </Container>
    </Box>
  );
};

export default ProjectClosure;
