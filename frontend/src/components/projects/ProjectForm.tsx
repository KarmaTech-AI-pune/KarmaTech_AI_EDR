import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardActions, Box, Typography, TextField, MenuItem } from '@mui/material';
import Button from '@mui/material/Button';
import { ProjectFormType, ProjectFormData } from '../../types';

export const ProjectForm = ({ project, onSubmit, onCancel }: ProjectFormType) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    clientName: '',
    estimatedCost: 0,
    startDate: new Date().toISOString().split('T')[0], // Set default to today
    endDate: new Date().toISOString().split('T')[0], // Set default to today
    status: 'Planning',
    progress: 0
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        clientName: project.clientName,
        estimatedCost: project.estimatedCost,
        startDate: project.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        endDate: project.endDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: project.status,
        progress: project.progress
      });
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
      estimatedCost: Number(formData.estimatedCost) || 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status || 'Planning',
      progress: Number(formData.progress) || 0
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
              label="Estimated Cost"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) || 0 })}
              required
              variant="outlined"
              size="small"
              inputProps={{ min: 0 }}
            />

            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              variant="outlined"
              size="small"
            >
              <MenuItem value="Planning">Planning</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Progress (%)"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) || 0 })}
              required
              variant="outlined"
              size="small"
              inputProps={{ min: 0, max: 100 }}
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
