import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthUser, User, UserRole } from '../models';
import * as usersApi from '../dummyapi/usersApi';
import UserDialog from '../components/dialogbox/adminpage/UserDialog';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [standardRates, setStandardRates] = useState<Record<number, number>>({});
  const [consultantStatus, setConsultantStatus] = useState<Record<number, boolean>>({});
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
    console.log(fetchedUsers);
    setUsers(fetchedUsers);
    
    // Initialize UI state for new users
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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      ...user,
      password: '', // Don't populate password for security
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
        // Clean up UI state
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
        // Update existing user
        const updatedUser = usersApi.updateUser(editingUser.id, {
          ...formData,
          password: formData.password, // Keep old password if not changed
        });
        // Update UI state
        setStandardRates(prev => ({
          ...prev,
          [updatedUser.id]: Number(formData.standardRate),
        }));
        setConsultantStatus(prev => ({
          ...prev,
          [updatedUser.id]: formData.isConsultant,
        }));
      } else {
        // Create new user
        if (!formData.username || !formData.password || !formData.email || !formData.name) {
          alert('Please fill in all required fields');
          return;
        }
        const newUser = usersApi.createUser({
          userName: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          roles: formData.role,
        });
        // Set UI state for new user
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
                  <Chip label={user.roles} color="primary" variant="outlined" />
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
