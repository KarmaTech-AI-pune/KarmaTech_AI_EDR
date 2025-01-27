/*
import React, { useState } from 'react';
import {
  Container,
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
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthUser, Role } from '../models/userModel';
import UserDialog from '../components/dialogbox/adminpage/UserDialog';
import { useUsers } from '../hooks/useUsers';

const Users = () => {
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [formData, setFormData] = useState<{
    userName: string;
    name: string;
    email: string;
    password: string;
    roles: Role[];
    standardRate: number;
    isConsultant: boolean;
  }>({
    userName: '',
    name: '',
    email: '',
    password: '',
    roles: [],
    standardRate: 0,
    isConsultant: false,
  });

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

  const handleEdit = (user: AuthUser) => {
    setEditingUser(user);
    setFormData({
      userName: user.userName,
      name: user.name,
      email: user.email,
      password: '', // Don't populate password for security
      roles: user.roles,
      standardRate: user.standardRate,
      isConsultant: user.isConsultant,
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const userData = {
        ...formData,
        standardRate: Number(formData.standardRate),
      };

      if (editingUser) {
        await updateUser(editingUser.id, {
          ...userData,
          password: formData.password || undefined, // Only send password if changed
        });
      } else {
        if (!formData.userName || !formData.password || !formData.email || !formData.name) {
          alert('Please fill in all required fields');
          return;
        }
        await createUser(userData);
      }
      handleClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : name === 'standardRate' 
          ? Number(value) 
          : value,
    }));
  };

  const handleRoleChange = (e: any) => {
    const selectedRole = e.target.value;
    setFormData(prev => ({
      ...prev,
      roles: [{ id: String(Date.now()), name: selectedRole }],
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">Error loading users: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 10, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Users Management</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User Name</TableCell>
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
                  {user.roles.map((role) => (
                    <Chip
                      key={role.id}
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
    </Container>
  );
};

export default Users;
*/