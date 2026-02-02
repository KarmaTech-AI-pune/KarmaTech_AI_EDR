import React, { useEffect, useState } from 'react';
import { Box, Breadcrumbs, Typography, Link, Skeleton } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { programApi } from '../../services/api/programApi';
import { projectApi } from '../../services/projectApi';
import { Program } from '../../types/program';
import { Project } from '../../models';

interface ProjectBreadcrumbProps {
  isExpanded: boolean;
}

export const ProjectBreadcrumb: React.FC<ProjectBreadcrumbProps> = ({ isExpanded }) => {
  const navigate = useNavigate();
  const { projectId, programId } = useProject();
  const [program, setProgram] = useState<Program | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBreadcrumbData = async () => {
      if (!projectId && !programId) return;

      setIsLoading(true);
      try {
        // Fetch program data if programId exists
        if (programId) {
          const programData = await programApi.getById(parseInt(programId));
          setProgram(programData);
        }

        // Fetch project data if projectId exists
        if (projectId) {
          const projectData = await projectApi.getById(projectId);
          setProject(projectData as Project);
        }
      } catch (error) {
        console.error('Error fetching breadcrumb data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBreadcrumbData();
  }, [projectId, programId]);

  const handleProgramClick = () => {
    if (programId) {
      // Navigate back to the main program management page
      navigate('/program-management');
    }
  };

  const handleProjectsClick = () => {
    if (programId) {
      // Navigate to the projects page for this program
      navigate('/program-management/projects');
    }
  };

  // Don't render if no data or if collapsed
  if (!isExpanded || (!program && !project)) {
    return null;
  }

  if (isLoading) {
    return (
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="text" width="80%" height={24} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="navigation breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-ol': {
            flexWrap: 'nowrap',
          },
          '& .MuiBreadcrumbs-li': {
            overflow: 'hidden',
          },
        }}
      >
        {/* Programs link - always show if we have program context */}
        {program && (
          <Link
            component="button"
            variant="body2"
            onClick={handleProgramClick}
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              padding: 0,
              font: 'inherit',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '80px',
              '&:hover': {
                // textDecoration: 'underline',
                color: 'primary.dark',
              },
              '&:focus': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
                borderRadius: '2px',
              },
            }}
            title="Go to Programs page"
          >
            Programs
          </Link>
        )}
        
        {/* Specific Program name - clickable to go to program's projects */}
        {program && (
          <Link
            component="button"
            variant="body2"
            onClick={handleProjectsClick}
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              padding: 0,
              font: 'inherit',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100px',
              '&:hover': {
                // textDecoration: 'underline',
                color: 'primary.dark',
              },
              '&:focus': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
                borderRadius: '2px',
              },
            }}
            title={`Go to ${program.name} projects`}
          >
            {program.name}
          </Link>
        )}
        
        {/* Current Project name - not clickable */}
        {project && (
          <Typography
            variant="body2"
            color="text.primary"
            sx={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '120px',
            }}
            title={project.name}
          >
            {project.name}
          </Typography>
        )}
      </Breadcrumbs>
    </Box>
  );
};