import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import { Project } from '../../data/types/dashboard';
import { SEVERITY_COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import StatusIcon from '../shared/StatusIcon';
import ProgressBar from '../shared/ProgressBar';
import ActionButton from '../shared/ActionButton';

interface ProjectCardProps {
  project: Project;
  onViewActionPlan: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onViewActionPlan }) => {
  const severityStyle = SEVERITY_COLORS[project.severity];

  return (
    <Card 
      sx={{ 
        mb: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatusIcon status={project.status} fontSize="small" />
            <Chip
              label={project.severity}
              size="small"
              sx={{
                backgroundColor: severityStyle.backgroundColor,
                color: severityStyle.color,
                border: `1px solid ${severityStyle.borderColor}`,
                fontWeight: 'medium'
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            {project.delay} days delayed
          </Typography>
        </Box>

        <Typography variant="h6" fontWeight="semibold" sx={{ mb: 1 }}>
          {project.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {project.region}
        </Typography>

        <Box sx={{ mb: 1 }}>
          <ProgressBar
            value={project.spent}
            max={project.budget}
            label="Budget Progress"
            showPercentage={false}
            color="primary"
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
            </Typography>
            <Typography variant="caption" fontWeight="medium">
              {Math.round((project.spent / project.budget) * 100)}%
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
          {project.issues.map((issue, index) => (
            <Chip
              key={index}
              label={issue}
              size="small"
              variant="outlined"
              sx={{ 
                fontSize: '0.75rem',
                height: 24
              }}
            />
          ))}
        </Stack>

        <ActionButton
          variant="primary"
          fullWidth
          size="small"
          onClick={() => onViewActionPlan(project.id)}
        >
          View Action Plan
        </ActionButton>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
