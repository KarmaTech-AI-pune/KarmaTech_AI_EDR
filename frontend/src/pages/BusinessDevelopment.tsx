import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Alert,
  TextField,
  Button,
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

export const BusinessDevelopment: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [canViewBusinessDevelopment, setCanViewBusinessDevelopment] = useState(false);
  const [canCreateBusinessDevelopment, setCanCreateBusinessDevelopment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(5);

  const businessDevStatuses: ProjectStatus[] = [
    ProjectStatus.Opportunity,
    ProjectStatus['Decision Pending'],
    ProjectStatus.Cancelled,
    ProjectStatus['Bid Submitted'],
    ProjectStatus['Bid Rejected']
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
          setError('Please log in to access Business Development');
          return;
        }

        setCurrentUser(user);

        if (user.roleDetails) {
          const hasBusinessDevViewPermission = user.roleDetails.permissions.includes(
            PermissionType.VIEW_BUSINESS_DEVELOPMENT
          );
          const hasBusinessDevCreatePermission = user.roleDetails.permissions.includes(
            PermissionType.CREATE_BUSINESS_DEVELOPMENT
          );
          
          setCanViewBusinessDevelopment(hasBusinessDevViewPermission);
          setCanCreateBusinessDevelopment(hasBusinessDevCreatePermission);

          if (!hasBusinessDevViewPermission) {
            setError('You do not have permission to view Business Development projects');
          } else {
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

  const handleCreateOpportunity = () => {
    if (canCreateBusinessDevelopment) {
      setIsCreatingProject(true);
    } else {
      alert('You do not have permission to create business opportunities');
    }
  };

  const handleSubmitProject = async (projectData: ProjectFormData) => {
    try {
      const newProjectData = {
        ...projectData,
        status: ProjectStatus.Opportunity
      };

      await projectApi.create(newProjectData);
      await fetchProjects();
      setIsCreatingProject(false);
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project');
    }
  };

  const handleProjectUpdated = async () => {
    await fetchProjects();
  };

  const handleProjectDeleted = async (projectId: number) => {
    try {
      await projectApi.delete(projectId);
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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || project.status === statusFilter;
    const matchesBusinessDevStatuses = businessDevStatuses.includes(project.status);

    return matchesSearch && matchesStatus && matchesBusinessDevStatuses;
  });

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
    <Box
      sx={{ 
        p: 2,
        bgcolor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
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
          Business Development
        </Typography>
        
        {canCreateBusinessDevelopment && !isCreatingProject && (
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleCreateOpportunity}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            New Opportunity
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
            statuses={businessDevStatuses}
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
        emptyMessage="No business development projects found"
        filterStatuses={businessDevStatuses}
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
    </Box>
  );
};

export default BusinessDevelopment;
