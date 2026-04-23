import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import AssessmentIcon from '@mui/icons-material/Assessment';
import { ProjectManagementProjectList } from '../components/project/ProjectManagementProjectList.tsx';
import { ProjectInitializationDialog } from '../components/project/ProjectInitializationDialog.tsx';
import { Pagination } from '../components/Pagination';
import { projectApi } from '../services/projectApi';
import { programApi } from '../services/programApi';
import { UserWithRole } from '../types';
import { Project } from '../models';
import { PermissionType } from '../models';
import ProjectStatusPieChart from '../components/dashboard/ProjectStatusPieChart';
import { authApi } from '../services/authApi';
import { ProjectFormData } from '../types/index.tsx';
import { useProject } from '../context/ProjectContext';
import { Program } from '../types/program';

export const ProjectManagement: React.FC = () => {
  const navigate = useNavigate();
  const { programId } = useProject();
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [canViewProjects, setCanViewProjects] = useState(false);
  const [canCreateProject, setCanCreateProject] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [program, setProgram] = useState<Program | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(5);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch program details if programId exists
  useEffect(() => {
    const fetchProgram = async () => {
      if (!programId) {
        setProgram(null);
        return;
      }

      try {
        const programData = await programApi.getById(parseInt(programId));
        setProgram(programData);
      } catch (err) {
        console.error('Error fetching program:', err);
        setProgram(null);
      }
    };

    fetchProgram();
  }, [programId]);

  const fetchProjects = async () => {
    try {
      if (!currentUser) {
        return;
      }

      // If programId is missing, do not fetch projects
      if (!programId || programId === 'null' || programId === 'undefined') {
        setProjects([]);
        setError(undefined);
        return;
      }

      // Check user permissions before fetching projects
      if (!currentUser.roleDetails) {
        setError('User role information not available');
        return;
      }

      const hasViewPermission = currentUser.roleDetails.permissions.includes(
        PermissionType.VIEW_PROJECT
      );

      if (!hasViewPermission) {
        setError('You do not have permission to view projects');
        setProjects([]);
        return;
      }

      // Always fetch projects by programId since projects must belong to a program
      const response = await projectApi.getAll(parseInt(programId));

      setProjects(response);
      setError(undefined);
    } catch (err: any) {
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
  }, [currentUser, canViewProjects, programId]); // Added programId dependency

  const handleCreateProject = () => {
    if (canCreateProject) {
      setIsCreatingProject(true);
    }
  };

  const handleProjectCreated = async (data: ProjectFormData) => {
    try {
      // Ensure programId is set if we're in program context
      const projectDataWithProgram = programId
        ? { ...data, programId: parseInt(programId) }
        : data;

      await projectApi.createProject(projectDataWithProgram);
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
      await projectApi.delete(projectId);
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

  // Calculate filtered projects only if there's no error and data is valid
  const roleFilteredProjects = useMemo(() => {
    if (!Array.isArray(projects)) {
      return [];
    }

    if (!currentUser) {
      return [];
    }

    return projects.filter((project: Project) => {
      // If user has admin permissions, show all projects
      if (currentUser.roleDetails?.permissions.includes(PermissionType.SYSTEM_ADMIN) ||
        currentUser.roleDetails?.permissions.includes(PermissionType.Tenant_ADMIN)) {
        return true;
      }

      const isMatch = currentUser.roles.some(role => {
        const roleName = role.name?.trim().toLowerCase();

        switch (roleName) {
          case 'regional manager':
          case 'regional director':
            const regionalMatch = project.regionalManagerId?.toLowerCase() === currentUser.id?.toLowerCase();
            return regionalMatch;
          case 'senior project manager':
            const spmMatch = project.seniorProjectManagerId?.toLowerCase() === currentUser.id?.toLowerCase();
            return spmMatch;
          case 'project manager':
            const pmMatch = project.projectManagerId?.toLowerCase() === currentUser.id?.toLowerCase();
            return pmMatch;
          default:
            return false;
        }
      });

      return isMatch;
    });
  }, [projects, currentUser]);

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
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                color: '#1a237e'
              }}
            >
              {programId && program ? `${program.name} - Projects` : 'Project Management'}
            </Typography>
            {/* {programId && program?.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {program.description}
              </Typography>
            )} */}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {programId && (
              <Button
                variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={() => navigate('/program-management/dashboard')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  '&:hover': {
                    borderColor: '#f57c00',
                    backgroundColor: 'rgba(255, 152, 0, 0.04)'
                  }
                }}
              >
                Program Dashboard
              </Button>
            )}

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
        </Box>

        <ProjectInitializationDialog
          open={isCreatingProject}
          onClose={handleCancelProject}
          onProjectCreated={handleProjectCreated}
        />

        <Divider sx={{ mb: 3 }} />

        {/* Project Status Pie Chart - Only show when NOT in program context */}
        {programId && (
          <Box sx={{
            width: '100%',
            maxWidth: 400,
            mx: 'auto',
            mb: 4,
            mt: 2
          }}>
            <ProjectStatusPieChart />
          </Box>
        )}

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
          emptyMessage={programId && program ? `No projects found for ${program.name}` : "No projects found"}
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