import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useProject } from '../../context/ProjectContext';
import { Project, OpportunityTracking } from '../../models';
import { getUserById } from '../../services/userApi';
import { projectApi } from '../../services/projectApi';
import { SideMenu } from '../../components/layout/SideMenu';
import { Outlet, useOutletContext } from 'react-router-dom';

const NAVBAR_HEIGHT = '64px';

type ContextType = { project: Project; managerNames: { [key: string]: string } };

export function useProjectDetailsContext() {
  return useOutletContext<ContextType>();
}

export const ProjectDetails: React.FC = () => {
  const { projectId } = useProject();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managerNames, setManagerNames] = useState<{ [key: string]: string }>({});
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        if (projectId) {
          const projectData = await projectApi.getById(projectId);
          if (projectData) {
            setProject(projectData as Project);
          } else {
            setError('Project not found');
          }
        } else {
          setError('No project selected');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Fetch manager data when the project data is loaded
  useEffect(() => {
    const fetchManagerData = async () => {
      if (!project) return;

      const managerIds = [
        project.projectManagerId,
        project.seniorProjectManagerId,
        project.regionalManagerId
      ].filter(Boolean);

      if (managerIds.length === 0) return;

      try {
        const fetchedNames: {[key: string]: string} = {};

        for (const id of managerIds) {
          try {
            const userData = await getUserById(id);
            if (userData) {
              fetchedNames[id] = userData.name;
            }
          } catch (err) {
            console.error(`Error fetching user with ID ${id}:`, err);
            fetchedNames[id] = 'Not assigned';
          }
        }

        setManagerNames(fetchedNames);
      } catch (err) {
        console.error('Error fetching manager data:', err);
      }
    };

    fetchManagerData();
  }, [project]);

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container>
        <Alert severity="warning">No project selected</Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: `calc(100vh - ${NAVBAR_HEIGHT})`,
        pt: `${NAVBAR_HEIGHT}`,
        bgcolor: 'background.default'
        
      }}
    >
      <SideMenu />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
          width: '100%',
          overflowX: 'auto',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {getProjectTitle(project)}
          </Typography>
          <Outlet context={{ project, managerNames }} />
        </Box>
      </Box>
    </Box>
  );
};

export const getProjectTitle = (project: Project | OpportunityTracking | null) => {
  if (!project) return 'Project Details';
  if ('name' in project) return project.name;
  if ('workName' in project) return project.workName;
  return 'Project Details';
};

export default ProjectDetails;
