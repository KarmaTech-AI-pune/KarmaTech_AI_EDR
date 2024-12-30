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
import { AuthUser, Role, RoleDefinition } from '../../models';
import * as usersApi from '../../services/userApi';
import UserDialog from '../dialogbox/adminpage/UserDialog';
import { useRoles } from '../../hooks/useRoles';

const UsersManagement = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [standardRates, setStandardRates] = useState<Record<string, number>>({});
  const [consultantStatus, setConsultantStatus] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [formData, setFormData] = useState({
    userName: '',
    name: '',
    email: '',
    password: '',
    roles: [] as Role[],
    standardRate: 0,
    isConsultant: false,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const fetchedUsers = await usersApi.getAllUsers();
      setUsers(fetchedUsers);
      console.log(fetchedUsers)
      const newRates: Record<string, number> = {};
      const newStatus: Record<string, boolean> = {};
      fetchedUsers.forEach(user => {
        if (!(user.id in standardRates)) {
          newRates[user.id] = user.standardRate;
        }
        if (!(user.id in consultantStatus)) {
          newStatus[user.id] = user.isConsultant;
        }
      });
      setStandardRates(prev => ({ ...prev, ...newRates }));
      setConsultantStatus(prev => ({ ...prev, ...newStatus }));
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
        const newRates = { ...standardRates };
        const newStatus = { ...consultantStatus };
        delete newRates[id];
        delete newStatus[id];
        setStandardRates(newRates);
        setConsultantStatus(newStatus);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        const updatedUser = await usersApi.updateUser(editingUser.id, {
          ...formData,
          password: formData.password || undefined,
        });
        setStandardRates(prev => ({
          ...prev,
          [updatedUser.id]: updatedUser.standardRate,
        }));
        setConsultantStatus(prev => ({
          ...prev,
          [updatedUser.id]: updatedUser.isConsultant,
        }));
      } else {
        if (!formData.userName || !formData.password || !formData.email || !formData.name) {
          alert('Please fill in all required fields');
          return;
        }
        const newUser = await usersApi.createUser(formData);
        setStandardRates(prev => ({
          ...prev,
          [newUser.id]: newUser.standardRate,
        }));
        setConsultantStatus(prev => ({
          ...prev,
          [newUser.id]: newUser.isConsultant,
        }));
      }
      await loadUsers();
      handleClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : name === 'standardRate' 
          ? Number(value) 
          : value,
    }));
  };

  const { roles: availableRoles } = useRoles();

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const selectedValues = event.target.value as string[];
    // Map selected role names to actual Role objects from the API
    const selectedRoles = selectedValues
      .map(value => availableRoles.find((role: RoleDefinition) => role.name === value))
      .filter((role): role is RoleDefinition => role !== undefined);
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
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.userName}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.roles.map((role, index) => (
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
                  <IconButton onClick={() => handleEdit(user)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)} color="error">
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
      />
    </Box>
  );
};

export default UsersManagement;
