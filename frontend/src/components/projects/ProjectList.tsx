import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  List,
  TextField,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {Button} from '@mui/material';
import { ProjectFilter } from './ProjectFilter';
import { ProjectItem } from './ProjectItem';
import { projectApi} from '../../services/api';
import { Project, ProjectFormData, ProjectStatus } from '../../types';
import { Pagination } from '../Pagination';
import { ProjectForm } from './ProjectForm';

export const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(5);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getAll();
      setProjects(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      setError('Failed to fetch projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: ProjectStatus | '') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleProjectDeleted = (projectId: number) => {
    setProjects(projects.filter(project => project.id !== projectId));
  };

  const handleProjectUpdated = () => {
    fetchProjects();
  };

  const handleNewProjectClick = () => {
    setShowNewProjectForm(true);
    setError(null);
  };

  const handleProjectFormSubmit = async (formData: ProjectFormData) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      if (!formData.name?.trim()) {
        throw new Error('Project name is required');
      }
      if (!formData.clientName?.trim()) {
        throw new Error('Client name is required');
      }

      await projectApi.create(formData);
      setSuccessMessage('Project created successfully!');
      setShowNewProjectForm(false);
      await fetchProjects();
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(err.message || 'Failed to create project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProjectFormCancel = () => {
    setShowNewProjectForm(false);
    setError(null);
  };

  const handleSuccessMessageClose = () => {
    setSuccessMessage(null);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesStatus = true
      if(statusFilter !== '')
      {
        matchesStatus = project.status === statusFilter;
      }
    return matchesSearch && matchesStatus;
  });

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading && !showNewProjectForm) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (showNewProjectForm) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#004a7f' }}>New Project</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <ProjectForm 
          onSubmit={handleProjectFormSubmit}
          onCancel={handleProjectFormCancel}
        />
        
        {submitting && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
     
      <Typography variant="h4" gutterBottom sx={{ color: '#004a7f' }}>Projects</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button 
          variant={'contained'}
          onClick={handleNewProjectClick}
        >
          New Project
        </Button>
        <Box sx={{ display: 'flex', gap:2}}>
          <ProjectFilter 
            onFilterChange={handleStatusFilter}
            currentFilter={statusFilter}
          />
          <TextField
            label="Search projects"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />
 
      <List>
        {currentProjects.map(project => (
          <ProjectItem 
            key={project.id} 
            project={project} 
            onProjectDeleted={handleProjectDeleted}
            onProjectUpdated={handleProjectUpdated}
          />
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
 
      <Pagination
        projectsPerPage={projectsPerPage}
        totalProjects={filteredProjects.length}
        paginate={paginate}
        currentPage={currentPage}
      />
         
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleSuccessMessageClose}
        message={successMessage}
      /> 
    </Paper>
  );
};
