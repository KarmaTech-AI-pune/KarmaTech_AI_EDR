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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthUser, UserRole } from '../../models';
import * as usersApi from '../../dummyapi/usersApi';
import UserDialog from '../dialogbox/adminpage/UserDialog';

const UsersManagement = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [standardRates, setStandardRates] = useState<Record<number, number>>({});
  const [consultantStatus, setConsultantStatus] = useState<Record<number, boolean>>({});
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: UserRole.Admin,
    standardRate: '0',
    isConsultant: false,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const fetchedUsers = usersApi.getAllUsers();
    setUsers(fetchedUsers);
    
    const newRates: Record<number, number> = {};
    const newStatus: Record<number, boolean> = {};
    fetchedUsers.forEach(user => {
      if (!(user.id in standardRates)) {
        newRates[user.id] = 0;
      }
      if (!(user.id in consultantStatus)) {
        newStatus[user.id] = false;
      }
    });
    setStandardRates(prev => ({ ...prev, ...newRates }));
    setConsultantStatus(prev => ({ ...prev, ...newStatus }));
  };

  const handleOpen = () => {
    setOpen(true);
    setEditingUser(null);
    setFormData({
      username: '',
      name: '',
      email: '',
      password: '',
      role: UserRole.Admin,
      standardRate: '0',
      isConsultant: false,
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
  };

  const handleEdit = (user: AuthUser) => {
    setEditingUser(user);
    setFormData({
      ...user,
      password: '',
      standardRate: standardRates[user.id]?.toString() || '0',
      isConsultant: consultantStatus[user.id] || false,
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const success = usersApi.deleteUser(id);
      if (success) {
        loadUsers();
        const newRates = { ...standardRates };
        const newStatus = { ...consultantStatus };
        delete newRates[id];
        delete newStatus[id];
        setStandardRates(newRates);
        setConsultantStatus(newStatus);
      }
    }
  };

  const handleSubmit = () => {
    try {
      if (editingUser) {
        const updatedUser = usersApi.updateUser(editingUser.id, {
          ...formData,
          password: formData.password || editingUser.password,
        });
        setStandardRates(prev => ({
          ...prev,
          [updatedUser.id]: Number(formData.standardRate),
        }));
        setConsultantStatus(prev => ({
          ...prev,
          [updatedUser.id]: formData.isConsultant,
        }));
      } else {
        if (!formData.username || !formData.password || !formData.email || !formData.name) {
          alert('Please fill in all required fields');
          return;
        }
        const newUser = usersApi.createUser({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        setStandardRates(prev => ({
          ...prev,
          [newUser.id]: Number(formData.standardRate),
        }));
        setConsultantStatus(prev => ({
          ...prev,
          [newUser.id]: formData.isConsultant,
        }));
      }
      loadUsers();
      handleClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRoleChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      role: e.target.value,
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
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip label={user.role} color="primary" variant="outlined" />
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
