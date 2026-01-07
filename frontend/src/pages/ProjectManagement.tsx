import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { ProjectManagementProjectList } from '../components/project/ProjectManagementProjectList.tsx';
import { ProjectInitializationDialog } from '../components/project/ProjectInitializationDialog.tsx';
import { Pagination } from '../components/Pagination';
//import { authApi } from '../dummyapi/authApi';
import { projectApi } from '../services/projectApi';
import { UserWithRole } from '../types';
import { Project } from '../models';
import { PermissionType } from '../models';
import ProjectStatusPieChart from '../components/dashboard/ProjectStatusPieChart';
import { authApi } from '../services/authApi';
import { ProjectFormData } from '../types/index.tsx';

export const ProjectManagement: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [canViewProjects, setCanViewProjects] = useState(false);
  const [canCreateProject, setCanCreateProject] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(5);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      if (!currentUser) {
        return;
      }

      let response: any;

      // if (canViewProjects) {
      //   response = (await projectApi.getByUserId(currentUser.id));
      // } 
     
      
         if (currentUser.roles.some(role => role.name === "Project Manager")) {
              response =(await projectApi.getByUserId(currentUser.id));;
            } 
            else if (currentUser.roles.some(role => role.name ===  "Senior Project Manager")) {
              response = (await projectApi.getByUserId(currentUser.id));
            }  
            else if (currentUser.roles.some(role => role.name ===  "Regional Director")) {
              response =  response = (await projectApi.getByUserId(currentUser.id));;
            } 
      
      else {
        response = await projectApi.getAll();
      }

      setProjects(response);
      setError(undefined);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to fetch projects');
    }
  };

  useEffect(() => {
    const checkUserPermissions = async () => {
      try {
        const user = await authApi.getCurrentUser();

        if (!user) {
          setError('Please log in to access Project Management');
          return;
        }

        setCurrentUser(user);

        if (user.roleDetails) {
          const hasProjectViewPermission = user.roleDetails.permissions.includes(
            PermissionType.VIEW_PROJECT
          );
          const hasProjectCreatePermission = user.roleDetails.permissions.includes(
            PermissionType.CREATE_PROJECT
          );

          setCanViewProjects(hasProjectViewPermission);
          setCanCreateProject(hasProjectCreatePermission);

          if (!hasProjectViewPermission) {
            setError('You do not have permission to view projects');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error checking user permissions');
        console.error(err);
      }
    };

    checkUserPermissions();
  }, []);

  useEffect(() => {
    if (currentUser && canViewProjects) {
      fetchProjects();
    }
  }, [currentUser, canViewProjects]);

  const handleCreateProject = () => {
    if (canCreateProject) {
      setIsCreatingProject(true);
    }
  };

  const handleProjectCreated = async (data: ProjectFormData) => {
    try {
      const storedProgramId = sessionStorage.getItem('selectedProgramId');
      if (!storedProgramId) {
        throw new Error('No program selected. Please select a program first.');
      }
      const programId = parseInt(storedProgramId);

      await projectApi.createProject(data, programId);
      await fetchProjects();
      setSuccessMessage('Project created successfully');
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleProjectUpdated = async () => {
    await fetchProjects();
    setSuccessMessage('Project updated successfully');
  };

  const handleProjectDeleted = async (projectId: string) => {
    try {
      console.log(`Attempting to delete project with ID: ${projectId}`);
      await projectApi.delete(projectId);
      console.log('Delete API call successful');
      setSuccessMessage('Project deleted successfully');
      // Refresh the project list after successful deletion
      await fetchProjects();
    } catch (err: any) {
      console.error('Error deleting project:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete project';
      setError(errorMessage);
      // Refresh the project list anyway to ensure UI is in sync with backend
      await fetchProjects();
    }
  };

  const handleCancelProject = () => {
    setIsCreatingProject(false);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  // First apply role-based filtering
  const roleFilteredProjects = projects.filter((project: Project) => {
    if (!currentUser) return false;

    // If user has admin permissions, show all projects
    if (currentUser.roleDetails?.permissions.includes(PermissionType.SYSTEM_ADMIN) ||
        currentUser.roleDetails?.permissions.includes(PermissionType.Tenant_ADMIN)) {
      return true;
    }

    // Check all roles the user has
    console.log('Filtering project:', project.name);
    console.log('Project details:', {
      regionalManagerId: project.regionalManagerId,
      seniorProjectManagerId: project.seniorProjectManagerId,
      projectManagerId: project.projectManagerId
    });
    console.log('Current user ID:', currentUser.id);
    console.log('Current user roles:', currentUser.roles);

    return currentUser.roles.some(role => {
      console.log('Checking role:', role.name);
      switch (role.name) {
        case 'Regional Manager':
          return true;
        case 'Regional Director':
          return true;
        case 'Senior Project Manager':
          return project.seniorProjectManagerId === currentUser.id;
        case 'Project Manager':
          return project.projectManagerId === currentUser.id;
        default:
          console.log('Unknown role:', role.name);
          return false;
      }
    });
  });

  // Then apply search filtering
  const searchFilteredProjects = roleFilteredProjects.filter((project: Project) => {
    const searchTermLower = searchTerm.toLowerCase();
    const name = project.name?.toLowerCase() || '';
    const description = project.description?.toLowerCase() || '';

    return name.includes(searchTermLower) ||
      description.includes(searchTermLower);
  });

  // Finally apply pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = searchFilteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (error) {
    return (
      <Box sx={{ p: 3, mt: '64px' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: '64px' }}>  {/* Added top margin to account for fixed navbar */}
      <Box
        sx={{
          p: 2,
          bgcolor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          m: 2
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              color: '#1a237e'
            }}
          >
            Project Management
          </Typography>

          {canCreateProject && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleCreateProject}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3
              }}
            >
              Initialize Project
            </Button>
          )}
        </Box>

        <ProjectInitializationDialog
          open={isCreatingProject}
          onClose={handleCancelProject}
          onProjectCreated={handleProjectCreated}
        />

        <Divider sx={{ mb: 3 }} />

        {/* Project Status Pie Chart */}
        <Box sx={{
          width: '100%',
          maxWidth: 400,
          mx: 'auto',
          mb: 4,
          mt: 2
        }}>
          <ProjectStatusPieChart />
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search projects"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              endAdornment: (
                <IconButton size="small">
                  <SearchIcon />
                </IconButton>
              ),
              sx: {
                borderRadius: 2,
                backgroundColor: 'background.paper'
              }
            }}
            sx={{
              width: 250,
            }}
          />
        </Box>

        <ProjectManagementProjectList
          projects={currentProjects}
          emptyMessage="No projects found"
          onProjectDeleted={handleProjectDeleted}
          onProjectUpdated={handleProjectUpdated}
        />

        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 3
        }}>
          <Pagination
            projectsPerPage={projectsPerPage}
            totalProjects={searchFilteredProjects.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </Box>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage(null)}
          message={successMessage}
        />
      </Box>
    </Box>
  );
};

export default ProjectManagement;
