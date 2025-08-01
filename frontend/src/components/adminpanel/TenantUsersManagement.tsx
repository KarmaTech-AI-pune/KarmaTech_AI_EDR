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
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  Tooltip,
  Avatar,
  } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import { Tenant, TenantUserRole } from '../../models/tenantModel';
import { TenantUser } from '../../models/tenantModel';
import * as tenantApi from '../../services/tenantApi';
import * as userApi from '../../services/userApi';

interface TenantUserWithDetails extends TenantUser {
  user?: {
    id: string;
    userName: string;
    name: string;
    email: string;
    avatar?: string;
  };
  tenant?: {
    id: number;
    name: string;
    domain: string;
  };
}

const TenantUsersManagement = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantUsers, setTenantUsers] = useState<TenantUserWithDetails[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [editingTenantUser, setEditingTenantUser] = useState<TenantUserWithDetails | null>(null);
  const [formData, setFormData] = useState({
    tenantId: 0,
    userId: '',
    role: TenantUserRole.User,
    isActive: true,
  });
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
    loadAvailableUsers();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      loadTenantUsers(selectedTenant);
    }
  }, [selectedTenant]);

  const loadTenants = async () => {
    try {
      const fetchedTenants = await tenantApi.getAllTenants();
      setTenants(fetchedTenants);
      if (fetchedTenants.length > 0 && !selectedTenant) {
        setSelectedTenant(fetchedTenants[0].id);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      setError('Failed to load tenants');
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const users = await userApi.getAllUsers();
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadTenantUsers = async (tenantId: number) => {
    try {
      // This would need to be implemented in the backend
      const users = await tenantApi.getTenantUsers(tenantId);
      setTenantUsers(users);
    } catch (error) {
      console.error('Error loading tenant users:', error);
      setError('Failed to load tenant users');
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditingTenantUser(null);
    setFormData({
      tenantId: selectedTenant || 0,
      userId: '',
      role: TenantUserRole.User,
      isActive: true,
    });
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (tenantUser: TenantUserWithDetails) => {
    setEditingTenantUser(tenantUser);
    setFormData({
      tenantId: tenantUser.tenantId,
      userId: tenantUser.userId,
      role: tenantUser.role,
      isActive: tenantUser.isActive,
    });
    setOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingTenantUser) {
        await tenantApi.updateTenantUser(editingTenantUser.id, {
          role: formData.role,
          isActive: formData.isActive,
        });
        setSuccess('Tenant user updated successfully');
      } else {
        await tenantApi.addTenantUser({
          tenantId: formData.tenantId,
          userId: formData.userId,
          role: formData.role,
          isActive: formData.isActive,
        });
        setSuccess('Tenant user added successfully');
      }
      
      if (selectedTenant) {
        loadTenantUsers(selectedTenant);
      }
      setOpen(false);
    } catch (error) {
      console.error('Error saving tenant user:', error);
      setError('Failed to save tenant user');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this user from the tenant?')) {
      try {
        await tenantApi.removeTenantUser(id);
        setSuccess('Tenant user removed successfully');
        if (selectedTenant) {
          loadTenantUsers(selectedTenant);
        }
      } catch (error) {
        console.error('Error removing tenant user:', error);
        setError('Failed to remove tenant user');
      }
    }
  };

  const getRoleColor = (role: TenantUserRole) => {
    switch (role) {
      case TenantUserRole.Owner:
        return 'error';
      case TenantUserRole.Admin:
        return 'warning';
      case TenantUserRole.Manager:
        return 'info';
      case TenantUserRole.User:
        return 'default';
      default:
        return 'default';
    }
  };

  const getRoleDisplayName = (role: TenantUserRole) => {
    switch (role) {
      case TenantUserRole.Owner:
        return 'Owner';
      case TenantUserRole.Admin:
        return 'Admin';
      case TenantUserRole.Manager:
        return 'Manager';
      case TenantUserRole.User:
        return 'User';
      default:
        return 'Unknown';
    }
  };

  const getTenantStatusDisplayName = (status: number) => {
    switch (status) {
      case 0:
        return 'Active';
      case 1:
        return 'Suspended';
      case 2:
        return 'Cancelled';
      case 3:
        return 'Trial';
      case 4:
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const getSelectedTenant = () => {
    return tenants.find(t => t.id === selectedTenant);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tenant Users Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Tenant Selection */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Select Tenant
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Tenant</InputLabel>
                <Select
                  value={selectedTenant || ''}
                  onChange={(e) => setSelectedTenant(e.target.value as number)}
                  label="Tenant"
                >
                  {tenants.map((tenant) => (
                    <MenuItem key={tenant.id} value={tenant.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={getTenantStatusDisplayName(tenant.status)} 
                          color={tenant.status === 0 ? 'success' : 'error'} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        {tenant.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Tenant Info */}
        <Grid item xs={12} md={8}>
          {getSelectedTenant() && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {getSelectedTenant()?.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Domain: {getSelectedTenant()?.domain}.localhost
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Company: {getSelectedTenant()?.companyName}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                    disabled={!selectedTenant}
                  >
                    Add User to Tenant
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Tenant Users List */}
        <Grid item xs={12}>
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Tenant Users ({tenantUsers.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tenantUsers.map((tenantUser) => (
                    <TableRow key={tenantUser.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                            {tenantUser.user?.avatar ? (
                              <img src={tenantUser.user.avatar} alt="Avatar" />
                            ) : (
                              tenantUser.user?.name?.charAt(0) || 'U'
                            )}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {tenantUser.user?.name || 'Unknown User'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {tenantUser.user?.userName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{tenantUser.user?.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getRoleDisplayName(tenantUser.role)} 
                          color={getRoleColor(tenantUser.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={tenantUser.isActive ? 'Active' : 'Inactive'} 
                          color={tenantUser.isActive ? 'success' : 'error'} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(tenantUser.joinedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(tenantUser)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove from tenant">
                          <IconButton 
                            onClick={() => handleDelete(tenantUser.id)} 
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tenantUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No users assigned to this tenant
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit Tenant User Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTenantUser ? 'Edit Tenant User' : 'Add User to Tenant'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {!editingTenantUser && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  label="Select User"
                >
                  {availableUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, width: 24, height: 24 }}>
                          {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" />
                          ) : (
                            user.name?.charAt(0) || 'U'
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{user.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as TenantUserRole })}
                label="Role"
              >
                <MenuItem value={TenantUserRole.Owner}>Owner</MenuItem>
                <MenuItem value={TenantUserRole.Admin}>Admin</MenuItem>
                <MenuItem value={TenantUserRole.Manager}>Manager</MenuItem>
                <MenuItem value={TenantUserRole.User}>User</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTenantUser ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantUsersManagement; 