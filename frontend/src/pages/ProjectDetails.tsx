import { Box, Typography, Paper, Button, Grid, Chip, LinearProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useContext } from 'react';
import { projectManagementAppContext } from '../App';
import { WBSChart } from "../components/WBSChart";

export const ProjectDetails = () => {
  const context = useContext(projectManagementAppContext);
  const project = context?.selectedProject;

  const handleBack = () => {
    if (context?.setScreenState) {
      context.setScreenState("Projects");
    }
  };

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No project selected</Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Projects
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" gutterBottom>
              {project.name}
            </Typography>
            <Chip 
              label={project.status}
              color={project.status.toLowerCase() === 'completed' ? 'success' : 'primary'}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {project.description}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Progress
            </Typography>
            <Box sx={{ width: '100%', mb: 1 }}>
              <LinearProgress variant="determinate" value={project.progress} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {project.progress}% Complete
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Client Information
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Client Name: {project.clientName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Estimated Cost: ${project.estimatedCost.toLocaleString()}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Timeline
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start Date: {new Date(project.startDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              End Date: {new Date(project.endDate).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Work Breakdown Structure
        </Typography>
        <WBSChart />
      </Paper>
    </Box>
  );
};
