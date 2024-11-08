import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardActions, Box, Typography, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import { ProjectFormType, ProjectFormData, ProjectStatus } from '../../types';

export const ProjectForm = ({ project, onSubmit, onCancel }: ProjectFormType) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    clientName: '',
    clientSector: 'Default',
    sector: 'Default',
    estimatedCost: 0,
    status: ProjectStatus.Opportunity,
    progress: 0,
    contractType: 'Default',
    currency: 'INR',
    createdAt: new Date().toISOString(),
    createdBy: 'System'
  });

  useEffect(() => {
    if (project) {
      const { id, ...projectData } = project;
      setFormData(projectData);
    }
  }, [project]);

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name.trim() || !formData.clientName.trim()) {
      return;
    }

    // Ensure all required fields have values
    const submitData: ProjectFormData = {
      name: formData.name.trim(),
      clientName: formData.clientName.trim(),
      clientSector: 'Default',
      sector: 'Default',
      estimatedCost: Number(formData.estimatedCost) || 0,
      status: ProjectStatus.Opportunity,
      progress: 0,
      contractType: 'Default',
      currency: 'INR',
      createdAt: new Date().toISOString(),
      createdBy: 'System'
    };

    console.log('Submitting form data:', submitData);
    onSubmit(submitData);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <Card sx={{ maxWidth: 400, width: '100%', p: 2 }}>
        <CardHeader
          title={
            <Typography variant="h5">
              {project ? 'Edit Project' : 'Create New Project'}
            </Typography>
          }
          sx={{ pb: 2 }}
        />
        <CardContent sx={{ '& .MuiTextField-root': { mb: 3 } }}>
          <Box>
            <TextField
              fullWidth
              label="Project Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              variant="outlined"
              size="small"
            />

            <TextField
              fullWidth
              label="Client Name"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              required
              variant="outlined"
              size="small"
            />

            <TextField
              fullWidth
              type="number"
              label="Estimated Cost (INR)"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) || 0 })}
              required
              variant="outlined"
              size="small"
              inputProps={{ min: 0 }}
            />
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', pt: 2, pb: 1 }}>
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleSubmit}
            color="primary"
          >
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};
