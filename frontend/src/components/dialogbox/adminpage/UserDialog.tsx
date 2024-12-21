import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { AuthUser, UserRole } from '../../../models';

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingUser: AuthUser | null;
  formData: {
    username: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    standardRate: string;
    isConsultant: boolean;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRoleChange: (e: any) => void;
}

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editingUser,
  formData,
  handleInputChange,
  handleRoleChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            name="username"
            label="Username"
            required
            value={formData.username}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            name="name"
            label="Name"
            required
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            required={!editingUser}
            value={formData.password}
            onChange={handleInputChange}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Roles</InputLabel>
            <Select
              value={formData.role}
              onChange={handleRoleChange}
              label="Roles"
              required
            >
              {Object.values(UserRole).map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          {editingUser ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDialog;
