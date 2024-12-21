import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { RoleDefinition, PermissionType} from '../../../models';

const PERMISSION_GROUPS = {
  Project: [
    PermissionType.VIEW_PROJECT,
    PermissionType.CREATE_PROJECT,
    PermissionType.EDIT_PROJECT,
    PermissionType.DELETE_PROJECT,
    PermissionType.REVIEW_PROJECT,
    PermissionType.APPROVE_PROJECT,
    PermissionType.SUBMIT_PROJECT_FOR_REVIEW,
    PermissionType.SUBMIT_PROJECT_FOR_APPROVAL,
  ],
  'Business Development': [
    PermissionType.VIEW_BUSINESS_DEVELOPMENT,
    PermissionType.CREATE_BUSINESS_DEVELOPMENT,
    PermissionType.EDIT_BUSINESS_DEVELOPMENT,
    PermissionType.DELETE_BUSINESS_DEVELOPMENT,
    PermissionType.REVIEW_BUSINESS_DEVELOPMENT,
    PermissionType.APPROVE_BUSINESS_DEVELOPMENT,
    PermissionType.SUBMIT_FOR_REVIEW,
    PermissionType.SUBMIT_FOR_APPROVAL,
  ],
  System: [
    PermissionType.SYSTEM_ADMIN,
  ],
};

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (roleData: RoleDefinition) => void;
  editingRole: RoleDefinition | null;
  roles: RoleDefinition[];
  formData: {
    name: string;
    permissions: PermissionType[];
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    permissions: PermissionType[];
  }>>;
}

const formatPermissionLabel = (permission: string) => {
  if (permission === 'SYSTEM_ADMIN') {
    return 'System administrator';
  }
  
  if (permission.includes('BUSINESS_DEVELOPMENT')) {
    return permission
      .replace('BUSINESS_DEVELOPMENT', '')
      .split('_')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') + ' business development';
  }
  
  if (permission.includes('PROJECT')) {
    return permission
      .replace('PROJECT', '')
      .split('_')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') + ' project';
  }
  
  return permission
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const RoleDialog: React.FC<RoleDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editingRole,
  roles,
  formData,
  setFormData,
}) => {
  const [selectedExistingRole, setSelectedExistingRole] = React.useState<string>('');

  const handleExistingRoleChange = (event: any) => {
    const selectedRole = event.target.value;
    setSelectedExistingRole(selectedRole);
    
    if (selectedRole) {
      const role = roles.find(r => r.name === selectedRole);
      if (role) {
        setFormData(prev => ({
          ...prev,
          name: '',
          permissions: [...role.permissions],
        }));
      }
    } else {
      setFormData({
        name: '',
        permissions: [],
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionChange = (permission: PermissionType) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      alert('Please fill in the role name');
      return;
    }

    const roleData: RoleDefinition = {
      id: editingRole?.id || Math.random().toString(),
      name: formData.name,
      permissions: formData.permissions,
    };

    onSubmit(roleData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingRole ? 'Edit Role' : 'Add New Role'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {!editingRole && (
            <FormControl fullWidth>
              <InputLabel>Copy from Existing Role</InputLabel>
              <Select
                value={selectedExistingRole}
                onChange={handleExistingRoleChange}
                label="Copy from Existing Role"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.name}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            name="name"
            label="Role Name"
            required
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            helperText="Enter a unique name for this role"
          />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Role Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the permissions for this role. Choose carefully as these determine what actions the role can perform.
          </Typography>
          {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
            <Accordion key={group}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  {group}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {permissions.map((permission) => (
                    <FormControlLabel
                      key={permission}
                      control={
                        <Checkbox
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionChange(permission)}
                        />
                      }
                      label={formatPermissionLabel(permission)}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {editingRole ? 'Save Changes' : 'Create Role'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleDialog;
