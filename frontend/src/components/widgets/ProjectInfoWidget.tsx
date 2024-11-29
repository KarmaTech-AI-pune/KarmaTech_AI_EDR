/*
import { Box, Typography, Grid, Chip, LinearProgress } from '@mui/material';
import { Project, ProjectStatus } from '../../types';

interface ProjectInfoWidgetProps {
  project: Project;
}

const ProjectInfoWidget: React.FC<ProjectInfoWidgetProps> = ({ project }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Opportunity: return 'warning';
      case ProjectStatus['In Progress']: return 'primary';
      case ProjectStatus.Completed: return 'success';
      case ProjectStatus['Decision Pending']: return 'info';
      case ProjectStatus['Bid Rejected']: return 'error';
      case ProjectStatus['Cancelled']: return 'error';
      case ProjectStatus['Bid Submitted']: return 'warning';
      case ProjectStatus['Bid Accepted']: return 'success';
      default: return 'default';
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" gutterBottom>
          {project.name}
        </Typography>
        <Chip 
          label={ProjectStatus[project.status]}
          color={getStatusColor(project.status)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          Client Information
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Client Name: {project.clientName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sector: {project.clientSector}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Estimated Cost: {project.currency} {project.estimatedCost.toLocaleString()}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Created At: {formatDate(project.createdAt)}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          Timeline
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Start Date: {formatDate(project.startDate)}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          End Date: {formatDate(project.endDate)}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Contract Type: {project.contractType}
        </Typography>
      </Grid>

      {project.progress !== undefined && (
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
      )}
    </Grid>
  );
};

export default ProjectInfoWidget;
*/