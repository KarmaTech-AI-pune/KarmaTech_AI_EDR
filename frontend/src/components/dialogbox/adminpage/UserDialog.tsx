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
  CircularProgress,
  FormHelperText,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { AuthUser, Role } from '../../../models/userModel';
import { useRoles } from '../../../hooks/useRoles';

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingUser: AuthUser | null;
  formData: {
    userName: string;
    name: string;
    email: string;
    password: string;
    roles: Role[];
    standardRate: number;
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
  const { roles: availableRoles, loading, error } = useRoles();

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    console.error('Error loading roles:', error);
  }

  const selectedRoleNames = formData.roles.map(role => role.name);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            name="userName"
            label="Username"
            required
            value={formData.userName}
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
          <FormControl fullWidth required>
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={selectedRoleNames}
              onChange={handleRoleChange}
              label="Roles"
              renderValue={(selected) => selected.join(', ')}
            >
              {availableRoles.map((role) => (
                <MenuItem key={role.id} value={role.name}>
                  <Checkbox checked={selectedRoleNames.includes(role.name)} />
                  {role.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select at least one role</FormHelperText>
          </FormControl>
          <TextField
            name="standardRate"
            label="Standard Rate"
            type="number"
            value={formData.standardRate.toString()}
            onChange={handleInputChange}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                name="isConsultant"
                checked={formData.isConsultant}
                onChange={handleInputChange}
              />
            }
            label="Is Consultant"
          />
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
