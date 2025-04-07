import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import TaskIcon from '@mui/icons-material/Task';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface FormsOverviewProps {
  onFormSelect?: (formId: string) => void;
}

const FormsOverview: React.FC<FormsOverviewProps> = ({ onFormSelect }) => {
  const formSections = [
    {
      id: 'wbs',
      title: 'PMD1. Work Breakdown Structure',
      icon: <TaskIcon />,
    },
    {
      id: 'jobStart',
      title: 'PMD2. Job Start Form',
      icon: <AssignmentIcon />,
    },
    {
      id: 'inputRegister',
      title: 'PMD3. Input Register',
      icon: <DescriptionIcon />,
    },
    {
      id: 'correspondence',
      title: 'PMD4. Correspondence Inward-Outward',
      icon: <EmailIcon />,
    },
    {
      id: 'review',
      title: 'PMD5. Check and Review Form',
      icon: <CheckCircleIcon />,
    },
    {
      id: 'changeControl',
      title: 'PMD6. Change Control Register',
      icon: <ChangeCircleIcon />,
    },
    {
      id: 'progressReview',
      title: 'PMD7. Monthly Progress Review',
      icon: <AssessmentIcon />,
    },
    {
      id: 'closure',
      title: 'PMD8. Project Closure',
      icon: <TaskIcon />,
    },
  ];

  const handleFormClick = (formId: string) => {
    if (onFormSelect) {
      onFormSelect(formId);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Project Management Forms
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Select a form to view and manage project documentation.
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Available Forms:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {formSections.map((form) => (
              <Box
                key={form.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  transition: 'background-color 0.2s',
                }}
                onClick={() => handleFormClick(form.id)}
              >
                {form.icon}
                <Typography
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {form.title}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FormsOverview;
