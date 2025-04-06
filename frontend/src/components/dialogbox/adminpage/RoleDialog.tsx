import React, { useEffect, useState } from 'react';
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
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PermissionDto, PermissionCategoryGroup, RoleWithPermissionsDto } from '../../../services/rolesApi';
import * as rolesApi from '../../../services/rolesApi';

interface FormData {
  id: string;
  name: string;
  minRate: number,
  isResourceRole: boolean,
  permissions: PermissionCategoryGroup[];
}

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (roleData: RoleWithPermissionsDto) => void;
  editingRole: RoleWithPermissionsDto | null;
  roles: RoleWithPermissionsDto[];
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
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
  const [selectedExistingRole, setSelectedExistingRole] = useState<string>('');
  const [availablePermissions, setAvailablePermissions] = useState<PermissionCategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      if (open) {
        try {
          setLoading(true);
          const permissions = await rolesApi.getPermissionsByGroupedByCategory();
          setAvailablePermissions(permissions);
        } catch (error) {
          console.error('Error loading permissions:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPermissions();
  }, [open]);

  const handleExistingRoleChange = (event: SelectChangeEvent<string>) => {
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
        id: '',
        name: '',
        minRate: 0,
        isResourceRole: false,
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

   const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;  // `checked` for checkbox
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked,  // Update state with checked value (true/false)
      }));
    };

  const handlePermissionChange = (permission: PermissionDto) => {
    setFormData(prev => {
      const category = permission.category;
      const existingGroupIndex = prev.permissions.findIndex(g => g.category === category);

      if (existingGroupIndex === -1) {
        // Add new permission group
        return {
          ...prev,
          permissions: [
            ...prev.permissions,
            {
              category,
              permissions: [permission]
            }
          ]
        };
      }

      const existingGroup = prev.permissions[existingGroupIndex];
      const permissionExists = existingGroup.permissions.some(p => p.id === permission.id);

      const updatedPermissions = [...prev.permissions];
      if (permissionExists) {
        // Remove permission
        updatedPermissions[existingGroupIndex] = {
          ...existingGroup,
          permissions: existingGroup.permissions.filter(p => p.id !== permission.id)
        };
        // Remove empty group
        if (updatedPermissions[existingGroupIndex].permissions.length === 0) {
          updatedPermissions.splice(existingGroupIndex, 1);
        }
      } else {
        // Add permission
        updatedPermissions[existingGroupIndex] = {
          ...existingGroup,
          permissions: [...existingGroup.permissions, permission]
        };
      }

      return {
        ...prev,
        permissions: updatedPermissions
      };
    });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      alert('Please fill in the role name');
      return;
    }

    const roleData: RoleWithPermissionsDto = {
      id: editingRole?.id || '',
      name: formData.name,
      minRate: formData.minRate,
      isResourceRole: formData.isResourceRole,
      permissions: formData.permissions,
    };

    onSubmit(roleData);
  };

  const renderPermissions = () => {
    if (loading) {
      return (
        <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
          <CircularProgress />
          <Typography>Loading permissions...</Typography>
        </Stack>
      );
    }

    if (!availablePermissions.length) {
      return (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          No permissions available
        </Typography>
      );
    }

    return availablePermissions.map((group) => (

      <Accordion key={group.category}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">
            {group.category}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {group.permissions.map((permission) => {
              const isChecked = formData.permissions
                .find(g => g.category === permission.category)
                ?.permissions.some(p => p.id === permission.id) || false;

              return (
                <FormControlLabel
                  key={permission.id}
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={() => handlePermissionChange(permission)}
                    />
                  }
                  label={formatPermissionLabel(permission.name)}
                />
              );
            })}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    ));
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
          <TextField
            name="minRate"
            label="Min Rate"
            type='number'
            value={formData.minRate}
            onChange={handleInputChange}
            fullWidth
            helperText="Enter Min Rate"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isResourceRole}
                onChange={handleCheckboxChange}
                name="isResourceRole"
              />
            }
            label="Is ResourceRole"
          />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Role Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the permissions for this role. Choose carefully as these determine what actions the role can perform.
          </Typography>
          {renderPermissions()}
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
