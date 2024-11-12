import { Box, Button, Paper } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useContext, useState, useEffect } from 'react';
import { projectManagementAppContext } from '../App';
import { ProjectStatus, OpportunityTracking } from '../types';
import { opportunityApi } from '../services/api';
import ProjectInfoWidget from '../components/widgets/ProjectInfoWidget';
import OpportunityTrackingWidget from '../components/widgets/OpportunityTrackingWidget';
import DecisionWidget from '../components/widgets/DecisionWidget';
import GoNoGoWidget from '../components/widgets/GoNoGoWidget';

export const ProjectDetails = () => {
  const context = useContext(projectManagementAppContext);
  const project = context?.selectedProject;
  const [opportunityTracking, setOpportunityTracking] = useState<OpportunityTracking | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpportunityTracking = async () => {
      if (project?.id) {
        try {
          const data = await opportunityApi.getByProjectId(project.id);
          setOpportunityTracking(data[0] || null);
          setApiError(null);
        } catch (error: any) {
          console.error('Failed to fetch opportunity tracking data:', error);
          
          if (error.response) {
            setApiError(`API Error: ${error.response.status} - ${error.response.data || 'No additional information'}`);
          } else if (error.request) {
            setApiError('No response received from the server');
          } else {
            setApiError('Error setting up the request: ' + error.message);
          }
        }
      }
    };

    if (project?.status === ProjectStatus.Opportunity) {
      fetchOpportunityTracking();
    }
  }, [project]);

  const handleBack = () => {
    if (context?.setScreenState) {
      context.setScreenState("Projects");
    }
  };

  const handleProjectUpdate = (updatedProject: any) => {
    if (context?.setSelectedProject) {
      context.setSelectedProject(updatedProject);
    }
  };

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
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
      {project.status === ProjectStatus['Bid Submitted'] && (
        <Box sx={{ pb: 3}}>
          <DecisionWidget 
            project={project} 
            onStatusUpdate={handleProjectUpdate} 
          />
        </Box>
      )}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <ProjectInfoWidget project={project} />
      </Paper>

      
        <OpportunityTrackingWidget 
          project={project}
          opportunityTracking={opportunityTracking}
          apiError={apiError}
        />
      
        
          <GoNoGoWidget 
            projectId={project.id} 
            project={project}
          />
      
    </Box>
  );
};
