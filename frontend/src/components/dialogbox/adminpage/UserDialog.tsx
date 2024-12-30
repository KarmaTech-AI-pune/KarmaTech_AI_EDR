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
  SelectChangeEvent,
} from '@mui/material';
import { AuthUser, Role } from '../../../models';
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
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleRoleChange: (event: SelectChangeEvent<string[]>) => void;
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
  const { roles, loading, error } = useRoles();
  const selectedRoleNames = formData.roles;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {loading && (
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </DialogContent>
      )}
      {error && (
        <DialogContent>
          <FormHelperText error sx={{ textAlign: 'center', fontSize: '1rem', mt: 2 }}>
            Error loading roles. Please try again.
          </FormHelperText>
        </DialogContent>
      )}
      {!loading && !error && (
        <>
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
                  value={selectedRoleNames.map(role => role.name)}
                  onChange={handleRoleChange}
                  label="Roles"
                  renderValue={(selected) => (selected as string[]).join(', ')}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.name}>
                      <Checkbox checked={selectedRoleNames.some(r => r.id === role.id)} />
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
                value={formData.standardRate}
                onChange={handleInputChange}
                inputProps={{ 
                  min: 0,
                  step: 0.01
                }}
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
        </>
      )}
    </Dialog>
  );
};

export default UserDialog;
