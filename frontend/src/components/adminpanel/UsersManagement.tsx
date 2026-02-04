import React, { useState, useEffect } from 'react';
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
  Chip,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import { Alert, Snackbar } from '@mui/material';
import { Role } from '../../models/roleModel';
import { AuthUser } from '../../models/userModel';

import { PermissionType, RoleDefinition } from '../../models/index';
import * as usersApi from '../../services/userApi';
import UserDialog from '../dialogbox/adminpage/UserDialog';
import PasswordDialog from '../dialogbox/adminpage/PasswordDialog';
import { useRoles } from '../../hooks/useRoles';

const UsersManagement = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    userName: '',
    name: '',
    email: '',
    password: '',
    roles: [] as Role[],
    standardRate: 0,
    isConsultant: false,
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const fetchedUsers = await usersApi.getAllUsers();      
      setUsers(fetchedUsers);
      console.log(fetchedUsers)
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditingUser(null);
    setFormData({
      userName: '',
      name: '',
      email: '',
      password: '',
      roles: [],
      standardRate: 0,
      isConsultant: false,
      createdAt: new Date().toISOString(),
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
  };

  const handleEdit = async (user: AuthUser) => {
    try {
      const userDetails = await usersApi.getUserById(user.id);
      setEditingUser(userDetails);
      setFormData({
        userName: userDetails.userName,
        name: userDetails.name,
        email: userDetails.email,
        password: '', // Don't populate password for security
        roles: userDetails.roles,
        standardRate: userDetails.standardRate,
        isConsultant: userDetails.isConsultant,
        createdAt: userDetails.createdAt,
      });
      setOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Failed to load user details');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersApi.deleteUser(id);
        await loadUsers();
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete user',
          severity: 'error'
        });
      }
    }
  };

  const handleResetPassword = (user: AuthUser) => {
    setSelectedUser(user);
    setPasswordDialogOpen(true);
  };

  const handlePasswordSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Password updated successfully',
      severity: 'success'
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await usersApi.updateUser(editingUser.id, {
          ...formData,
          password: formData.password || undefined,
        });
      } else {        
        if (!formData.userName || !formData.password || !formData.email || !formData.name) {
          alert('Please fill in all required fields');
          return;
        }
        await usersApi.createUser(formData);
      }
      await loadUsers();
      handleClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
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

  const { roles: availableRoles } = useRoles();

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const selectedValues = event.target.value as string[];
    // Map selected role names to actual Role objects from the API
    const selectedRoles = selectedValues
      .map(value => availableRoles.find(role => role.name === value))
      .filter((role): role is RoleDefinition => role !== undefined)
      .map(role => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions as PermissionType[]
      }));

    setFormData(prev => ({
      ...prev,
      roles: selectedRoles,
    }));
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Users Management</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table sx={{ '& td, th': { padding: '4px 8px', fontSize: '0.875rem' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Standard Rate</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Is Consultant</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Roles</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.userName}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.standardRate}</TableCell>
                <TableCell>{user.isConsultant ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  {user.roles.map((role: Role, index) => (
                    <Chip
                      key={index}
                      label={role.name}
                      color="primary"
                      variant="outlined"
                      style={{ marginRight: '5px' }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)} color="primary" title="Edit user">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleResetPassword(user)} color="warning" title="Reset password">
                    <LockResetIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)} color="error" title="Delete user">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <UserDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        editingUser={editingUser}
        formData={formData}
        handleInputChange={handleInputChange}
        handleRoleChange={handleRoleChange}
        handleCheckboxChange={handleCheckboxChange}
      />

      <PasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        user={selectedUser}
        onSuccess={handlePasswordSuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersManagement;
