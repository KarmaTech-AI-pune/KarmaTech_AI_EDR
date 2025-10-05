import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { CheckCircle, Warning } from '@mui/icons-material';
import { Project, AISuggestion } from '../../data/types/dashboard';
import ProjectCard from './ProjectCard';

interface PriorityProjectsPanelProps {
  projects: Project[];
  suggestions: AISuggestion[];
  onViewActionPlan: (projectId: string) => void;
}

const PriorityProjectsPanel: React.FC<PriorityProjectsPanelProps> = ({
  projects,
  suggestions,
  onViewActionPlan
}) => {
  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 20 }} />;
      case 'warning':
        return <Warning sx={{ fontSize: 20 }} />;
      default:
        return <CheckCircle sx={{ fontSize: 20 }} />;
    }
  };

  const getSuggestionColor = (type: AISuggestion['type']) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#e8f5e8',
          iconColor: '#2e7d32'
        };
      case 'warning':
        return {
          backgroundColor: '#fff3e0',
          iconColor: '#ef6c00'
        };
      default:
        return {
          backgroundColor: '#e3f2fd',
          iconColor: '#1976d2'
        };
    }
  };

  return (
    <Box>
      {/* Priority Projects */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" fontWeight="semibold">
              Projects Needing Attention
            </Typography>
            <Chip
              label={`${projects.length} Critical`}
              size="small"
              sx={{
                backgroundColor: '#ffebee',
                color: '#c62828',
                fontWeight: 'medium'
              }}
            />
          </Box>

          <Box>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewActionPlan={onViewActionPlan}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="semibold" sx={{ mb: 3 }}>
            AI Suggestions
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {suggestions.map((suggestion) => {
              const colors = getSuggestionColor(suggestion.type);
              return (
                <Box
                  key={suggestion.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    p: 2,
                    backgroundColor: colors.backgroundColor,
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ color: colors.iconColor, mt: 0.25 }}>
                    {getSuggestionIcon(suggestion.type)}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="body2" 
                      fontWeight="medium" 
                      sx={{ 
                        mb: 0.5,
                        color: suggestion.type === 'success' ? '#1b5e20' : 
                               suggestion.type === 'warning' ? '#e65100' : '#0d47a1'
                      }}
                    >
                      {suggestion.title}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: suggestion.type === 'success' ? '#2e7d32' : 
                               suggestion.type === 'warning' ? '#ef6c00' : '#1976d2'
                      }}
                    >
                      {suggestion.description}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PriorityProjectsPanel;
