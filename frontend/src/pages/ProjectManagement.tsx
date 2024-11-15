import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Alert,
  TextField,
  Button,
  Paper,
  Container,
  Divider,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { GeneralProjectList } from '../components/projects/GeneralProjectList';
import { ProjectFilter } from '../components/projects/ProjectFilter';
import { ProjectForm } from '../components/projects/ProjectForm';
import { Pagination } from '../components/Pagination';
import { authApi } from '../dummyapi/authApi';
import { UserWithRole, Project, ProjectStatus, ProjectFormData } from '../types';
import { PermissionType } from '../dummyapi/database/dummyRoles';
import { projectApi } from '../dummyapi/projectApi';

export const ProjectManagement: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [canViewProjects, setCanViewProjects] = useState(false);
  const [canCreateProject, setCanCreateProject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // New state for form visibility
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  // Filtering and Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(5);

  // Project Management Specific Statuses
  const projectManagementStatuses: ProjectStatus[] = [
    ProjectStatus['In Progress'],
    ProjectStatus.Completed,
    ProjectStatus.Cancelled
  ];

  const fetchProjects = async () => {
    try {
      const allProjects = await projectApi.getAll();
      setProjects(allProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects');
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

        // Check specific permissions for Project Management
        if (user.roleDetails) {
          const hasProjectViewPermission = user.roleDetails.permissions.includes(
            PermissionType.VIEW_PROJECTS
          );
          const hasProjectCreatePermission = user.roleDetails.permissions.includes(
            PermissionType.CREATE_PROJECT
          );
          
          setCanViewProjects(hasProjectViewPermission);
          setCanCreateProject(hasProjectCreatePermission);

          if (!hasProjectViewPermission) {
            setError('You do not have permission to view projects');
          } else {
            // Fetch all projects
            await fetchProjects();
          }
        }
      } catch (err) {
        setError('Error checking user permissions');
        console.error(err);
      }
    };

    checkUserPermissions();
  }, []);

  const handleCreateProject = () => {
    if (canCreateProject) {
      setIsCreatingProject(true);
    } else {
      alert('You do not have permission to create projects');
    }
  };

  const handleSubmitProject = async (projectData: ProjectFormData) => {
    try {
      // Ensure the project status is set to In Progress for Project Management
      const newProjectData = {
        ...projectData,
        status: ProjectStatus['In Progress']
      };

      await projectApi.create(newProjectData);
      
      // Refetch projects to ensure updated list
      await fetchProjects();
      
      // Close the form
      setIsCreatingProject(false);
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project');
    }
  };

  const handleProjectUpdated = async () => {
    // Refetch projects after an update
    await fetchProjects();
  };

  const handleProjectDeleted = async (projectId: number) => {
    try {
      await projectApi.delete(projectId);
      
      // Refetch projects to ensure updated list
      await fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    }
  };

  const handleCancelProject = () => {
    setIsCreatingProject(false);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: ProjectStatus | '') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Filter projects based on search, status, and project management statuses
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || project.status === statusFilter;
    
    const matchesProjectManagementStatuses = projectManagementStatuses.includes(project.status);

    return matchesSearch && matchesStatus && matchesProjectManagementStatuses;
  });

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ 
        p: 3, 
        mt: 4, 
        backgroundColor: 'background.default',
        borderRadius: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h4" sx={{ 
            color: 'primary.main', 
            fontWeight: 600 
          }}>
            Project Management
          </Typography>
          
          {canCreateProject && !isCreatingProject && (
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
              New Project
            </Button>
          )}
        </Box>

        {isCreatingProject && (
          <Box sx={{ mb: 3 }}>
            <ProjectForm 
              onSubmit={handleSubmitProject}
              onCancel={handleCancelProject}
            />
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ProjectFilter 
              onFilterChange={handleStatusFilter}
              currentFilter={statusFilter}
              statuses={projectManagementStatuses}
            />
            
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
        </Box>

        <GeneralProjectList 
          projects={currentProjects}
          emptyMessage="No project management projects found"
          filterStatuses={projectManagementStatuses}
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
            totalProjects={filteredProjects.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </Box>
      </Paper>
    </Container>
  )
      }
