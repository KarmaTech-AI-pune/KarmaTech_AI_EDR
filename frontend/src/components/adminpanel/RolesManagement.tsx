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
import * as rolesApi from '../../services/rolesApi';
import type { RoleWithPermissionsDto, PermissionCategoryGroup } from '../../services/rolesApi';
import RoleDialog from '../dialogbox/adminpage/RoleDialog';



const RolesManagement = () => {
  const [roles, setRoles] = useState<RoleWithPermissionsDto[]>([]);
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissionsDto | null>(null);
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    minRate: number,
    isResourceRole: boolean,
    permissions: PermissionCategoryGroup[];
  }>({
    id: '',
    name: '',
    minRate: 0,
    isResourceRole: false,
    permissions: [],
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const fetchedRoles = await rolesApi.getAllRolesWithPermissions();
      setRoles(fetchedRoles);
    } catch (error) {
      console.error('Error loading roles:', error);
      // TODO: Add error notification
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditingRole(null);
    setFormData({
      id: '',
      name: '',
      minRate: 0,
      isResourceRole: false,
      permissions: [],
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRole(null);
  };

  const handleEdit = async (role: RoleWithPermissionsDto) => {
    try {
      setEditingRole(role);
      setFormData({
        id: role.id,
        name: role.name,
        isResourceRole: role.isResourceRole,
        minRate: role.minRate,
        permissions: role.permissions,
      });
      setOpen(true);
    } catch (error) {
      console.error('Error loading role permissions:', error);
      // TODO: Add error notification
    }
  };

  const handleDelete = async (role: RoleWithPermissionsDto) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await rolesApi.deleteRole(role.id);
        await loadRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        // TODO: Add error notification
      }
    }
  };

  const handleSubmit = async (roleData: RoleWithPermissionsDto) => {
    try {
      if (editingRole) {
        await rolesApi.updateRole(editingRole.id, roleData);
      } else {
        await rolesApi.createRole([roleData]);
      }
      await loadRoles();
      handleClose();
    } catch (error) {
      console.error('Error saving role:', error);
      // TODO: Add error notification
    }
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

  const renderPermissionChips = (role: RoleWithPermissionsDto) => {
    const groups = role.permissions.reduce((acc, group) => ({
      ...acc,
      [group.category]: group.permissions.map(p => p.name)
    }), {} as Record<string, string[]>);

    const knownCategories = ['Project', 'Business Development', 'System'];
    const otherPermissions = Object.entries(groups)
      .filter(([category]) => !knownCategories.includes(category))
      .flatMap(([, perms]) => perms);

    return (
      <Stack direction="row" spacing={1}>
        {groups['Project']?.length > 0 && (
          <Tooltip title={groups['Project'].map(formatPermissionLabel).join(', ')}>
            <Chip
              icon={<FolderIcon />}
              label={`${groups['Project'].length} Project`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Tooltip>
        )}
        {groups['Business Development']?.length > 0 && (
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
        {groups['System']?.length > 0 && (
          <Tooltip title={groups['System'].map(formatPermissionLabel).join(', ')}>
            <Chip
              icon={<AdminPanelSettingsIcon />}
              label="System Admin"
              color="warning"
              variant="outlined"
              size="small"
            />
          </Tooltip>
        )}

        {otherPermissions.length > 0 && (
          <Tooltip title={otherPermissions.map(formatPermissionLabel).join(', ')}>
            <Chip
              label={`${otherPermissions.length} Other`}
              color="default"
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
              <TableCell>Min Rate</TableCell>
              <TableCell>Resource Role</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles && roles.length > 0 ? (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.minRate}</TableCell>
                  <TableCell>{role.isResourceRole ? 'Yes' : 'No'}</TableCell>
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No roles found
                </TableCell>
              </TableRow>
            )}
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
