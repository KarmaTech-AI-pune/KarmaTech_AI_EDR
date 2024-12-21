import { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Stack,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { RoleDefinition, PermissionType, UserRole } from '../../models';
import { rolesApi } from '../../dummyapi/rolesApi';
import RoleDialog from '../dialogbox/adminpage/RoleDialog';

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

const RolesManagement = () => {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as PermissionType[],
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    const fetchedRoles = rolesApi.getAllRoles();
    setRoles(fetchedRoles);
  };

  const handleOpen = () => {
    setOpen(true);
    setEditingRole(null);
    setFormData({
      name: '',
      permissions: [],
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRole(null);
  };

  const handleEdit = (role: RoleDefinition) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      permissions: role.permissions,
    });
    setOpen(true);
  };

  const handleDelete = async (role: RoleDefinition) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        const success = rolesApi.deleteRole(role.name as UserRole);
        if (success) {
          loadRoles();
        }
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleSubmit = (roleData: RoleDefinition) => {
    try {
      if (editingRole) {
        rolesApi.updateRole(editingRole.name as UserRole, roleData);
      } else {
        rolesApi.createRole(roleData.name as UserRole, roleData);
      }
      loadRoles();
      handleClose();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const getPermissionsByGroup = (permissions: PermissionType[]) => {
    const groups: { [key: string]: PermissionType[] } = {
      Project: [],
      'Business Development': [],
      System: [],
    };

    permissions.forEach(permission => {
      if (PERMISSION_GROUPS.Project.includes(permission)) {
        groups.Project.push(permission);
      } else if (PERMISSION_GROUPS['Business Development'].includes(permission)) {
        groups['Business Development'].push(permission);
      } else if (PERMISSION_GROUPS.System.includes(permission)) {
        groups.System.push(permission);
      }
    });

    return groups;
  };

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

  const renderPermissionChips = (role: RoleDefinition) => {
    const groups = getPermissionsByGroup(role.permissions);
    
    return (
      <Stack direction="row" spacing={1}>
        {groups.Project.length > 0 && (
          <Tooltip title={groups.Project.map(formatPermissionLabel).join(', ')}>
            <Chip
              icon={<FolderIcon />}
              label={`${groups.Project.length} Project`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Tooltip>
        )}
        {groups['Business Development'].length > 0 && (
          <Tooltip title={groups['Business Development'].map(formatPermissionLabel).join(', ')}>
            <Chip
              icon={<BusinessIcon />}
              label={`${groups['Business Development'].length} Business`}
              color="success"
              variant="outlined"
              size="small"
            />
          </Tooltip>
        )}
        {groups.System.length > 0 && (
          <Tooltip title={groups.System.map(formatPermissionLabel).join(', ')}>
            <Chip
              icon={<AdminPanelSettingsIcon />}
              label="System Admin"
              color="warning"
              variant="outlined"
              size="small"
            />
          </Tooltip>
        )}
      </Stack>
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Roles Management</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add New Role
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>
                  {renderPermissionChips(role)}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(role)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(role)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <RoleDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        editingRole={editingRole}
        roles={roles}
        formData={formData}
        setFormData={setFormData}
      />
    </Box>
  );
};

export default RolesManagement;
