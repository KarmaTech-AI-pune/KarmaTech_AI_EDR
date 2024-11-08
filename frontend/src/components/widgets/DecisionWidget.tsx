import React, { useState } from 'react';
import { Typography, Paper, Grid, Button, Alert } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { Project, ProjectStatus } from '../../types';
//import { updateProjectStatus } from '../../services/api';

interface DecisionWidgetProps {
  project: Project;
  onStatusUpdate?: (updatedProject: Project) => void;
}

const DecisionWidget: React.FC<DecisionWidgetProps> = ({ project, onStatusUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only render for projects with Decision Pending status
  if (project.status !== ProjectStatus['Decision Pending']) {
    return null;
  }

  const handleStatusUpdate = async (newStatus: ProjectStatus) => {
    setIsLoading(true);
    setError(null);
    /*
    try {
      const updatedProject = await updateProjectStatus(project.id, newStatus);
      onStatusUpdate?.(updatedProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }*/
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 3, 
        mt: 2, 
        backgroundColor: 'rgba(0, 0, 0, 0.02)' 
      }}
    >
      <Typography variant="h6" color="text.primary" gutterBottom>
        Bid Decision
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => handleStatusUpdate(ProjectStatus['Bid Accepted'])}
            disabled={isLoading}
            sx={{ 
              textTransform: 'none', 
              borderRadius: 2 
            }}
          >
            Bid Accepted
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<Cancel />}
            onClick={() => handleStatusUpdate(ProjectStatus['Bid Rejected'])}
            disabled={isLoading}
            sx={{ 
              textTransform: 'none', 
              borderRadius: 2 
            }}
          >
            Bid Rejected
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DecisionWidget;
