import { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardActions, 
  Box, 
  Typography, 
  TextField,
  Alert
} from '@mui/material';
import Button from '@mui/material/Button';
import { ProjectFormType, ProjectFormData, ProjectStatus } from '../../types';
import { authApi } from '../../dummyapi/authApi';
import { PermissionType } from '../../dummyapi/database/dummyRoles';

export const NewProjectManagementForm = ({ project, onSubmit, onCancel }: ProjectFormType) => {
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [canCreateProject, setCanCreateProject] = useState(false);
  const [canEditProject, setCanEditProject] = useState(false);

  useEffect(() => {
    const checkUserPermissions = async () => {
      const user = await authApi.getCurrentUser();
      
      if (!user) {
        setCurrentUser(null);
        setCanCreateProject(false);
        setCanEditProject(false);
        return;
      }

      setCurrentUser(user);

      // Check if user has specific project permissions
      if (user.roleDetails) {
        setCanCreateProject(
          user.roleDetails.permissions.includes(PermissionType.CREATE_PROJECT)
        );
        setCanEditProject(
          user.roleDetails.permissions.includes(PermissionType.EDIT_PROJECT)
        );
      }
    };

    checkUserPermissions();
  }, []);

  useEffect(() => {
    if (project) {
      const { id, ...projectData } = project;
      setFormData(projectData);
    }
  }, [project]);

  const handleSubmit = () => {
    // Check permissions
    if (project && !canEditProject) {
      setError('You do not have permission to edit projects.');
      return;
    }

    if (!project && !canCreateProject) {
      setError('You do not have permission to create projects.');
      return;
    }

    // Basic validation
    if (!formData.name.trim() || !formData.clientName.trim()) {
      setError('Project name and client name are required.');
      return;
    }

    // Ensure all required fields have values
    const submitData: ProjectFormData = {
      name: formData.name.trim(),
      clientName: formData.clientName.trim(),
      clientSector: formData.clientSector || 'Default',
      sector: formData.sector || 'Default',
      estimatedCost: Number(formData.estimatedCost) || 0,
      status: ProjectStatus.Opportunity,
      progress: 0,
      contractType: formData.contractType || 'Default',
      currency: formData.currency || 'INR',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'System'
    };

    console.log('Submitting form data:', submitData);
    onSubmit(submitData);
  };

  // If user lacks permissions, show error
  if (project && !canEditProject) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Alert severity="error">
          You do not have permission to edit projects.
        </Alert>
      </Box>
    );
  }

  if (!project && !canCreateProject) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Alert severity="error">
          You do not have permission to create projects.
        </Alert>
      </Box>
    );
  }

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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <CardContent sx={{ '& .MuiTextField-root': { mb: 3 } }}>
          <Box>
            <TextField
              fullWidth
              label="Project Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setError(null);
              }}
              required
              variant="outlined"
              size="small"
              disabled={!canCreateProject && !canEditProject}
            />

            <TextField
              fullWidth
              label="Client Name"
              value={formData.clientName}
              onChange={(e) => {
                setFormData({ ...formData, clientName: e.target.value });
                setError(null);
              }}
              required
              variant="outlined"
              size="small"
              disabled={!canCreateProject && !canEditProject}
            />

            <TextField
              fullWidth
              type="number"
              label="Estimated Cost (INR)"
              value={formData.estimatedCost}
              onChange={(e) => {
                setFormData({ ...formData, estimatedCost: Number(e.target.value) || 0 });
                setError(null);
              }}
              required
              variant="outlined"
              size="small"
              inputProps={{ min: 0 }}
              disabled={!canCreateProject && !canEditProject}
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
            disabled={!canCreateProject && !canEditProject}
          >
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};
