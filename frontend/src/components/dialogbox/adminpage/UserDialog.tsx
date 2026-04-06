import React, { useState } from 'react';
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
  SelectChangeEvent,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AuthUser } from '../../../models/userModel';
import { Role } from '../../../models/roleModel';
import { useRoles } from '../../../hooks/useRoles';
import { useNumericInput } from '../../../hooks/useNumericInput';

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
  handleRoleChange: (event: SelectChangeEvent<string[]>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editingUser,
  formData,
  handleInputChange,
  handleRoleChange,
  handleCheckboxChange
}) => {
  const { roles, loading, error } = useRoles();
  const selectedRoleNames = formData.roles;

  // 🔹 keep errors in local state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { value: standardRateValue, setValue: setStandardRateValue, handleChange: handleRateChange } =
    useNumericInput(formData.standardRate);

  React.useEffect(() => {
    setStandardRateValue(String(formData.standardRate ?? ""));
  }, [formData.standardRate, setStandardRateValue]);

    // when hook changes, push update to parent formData
  const handleStandardRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleRateChange(e); // sanitize locally

    // Create a synthetic event with the correct types
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: "standardRate",
        value: e.target.value, // keep as string for compatibility
      },
    } as React.ChangeEvent<HTMLInputElement>;

    handleInputChange(syntheticEvent);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required";
    } else if (formData.userName.trim().split(/\s+/).length > 1) {
      newErrors.userName = "Username should be a single word";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!editingUser && !formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!formData.standardRate || formData.standardRate <= 0) {
      newErrors.standardRate = "Standard rate must be greater than 0";
    }

    if (formData.roles.length === 0) {
      newErrors.roles = "Select at least one role";
    }

    return newErrors;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    onSubmit(); 
  };

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
                error={submitted && !!errors.userName}
                helperText={submitted ? errors.userName : ""}
              />
              <TextField
                name="name"
                label="Name"
                required
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                error={submitted && !!errors.name}
                helperText={submitted ? errors.name : ""}
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                error={submitted && !!errors.email}
                helperText={submitted ? errors.email : ""}
              />
              <TextField
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required={!editingUser}
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                error={submitted && !!errors.password}
                helperText={submitted ? errors.password : ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(prev => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                name="standardRate"
                label="Standard Rate"
                type="number"
                required={!editingUser}
                value={standardRateValue}         // ✅ hook’s value
                onChange={handleStandardRateChange} // ✅ sync hook + parent
                fullWidth
                error={submitted && !!errors.standardRate}
                helperText={submitted ? errors.standardRate : ""}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isConsultant}
                    onChange={handleCheckboxChange}
                    name="isConsultant"
                  />
                }
                label="IsConsultant"
              />

              <FormControl fullWidth required error={submitted && !!errors.roles}>
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
                <FormHelperText>
                  {submitted ? errors.roles : "Select at least one role"}
                </FormHelperText>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingUser ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
  
};

export default UserDialog;