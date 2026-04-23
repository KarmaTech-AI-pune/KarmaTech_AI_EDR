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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  Tooltip,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import StorageIcon from '@mui/icons-material/Storage';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import * as tenantApi from '../../services/tenantApi';
import * as subscriptionApi from '../../services/subscriptionApi';
import { Tenant, TenantStatus } from '../../models/tenantModel';
import { SubscriptionPlan } from '../../models/subscriptionModel';

const TenantManagement = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    domain: '',
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    subscriptionPlanId: '',
    maxUsers: 10,
    maxProjects: 50,
    status: TenantStatus.Active,
    isIsolated: false,
    applicationName: '',
    logoUrl: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenants();
    loadSubscriptionPlans();
  }, []);

  const loadTenants = async () => {
    try {
      const fetchedTenants = await tenantApi.getAllTenants();
      setTenants(fetchedTenants);
    } catch (error) {
      console.error('Error loading tenants:', error);
      setError('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionPlans = async () => {
    try {
      const plans = await subscriptionApi.getSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditingTenant(null);
    setFormData({
      id: 0,
      name: '',
      domain: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      subscriptionPlanId: '',
      maxUsers: 10,
      maxProjects: 50,
      status: TenantStatus.Active,
      isIsolated: false,
      applicationName: '',
      logoUrl: '',
    });
    setLogoFile(null);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTenant(null);
    setLogoFile(null);
    setError(null);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      id: tenant.id,
      name: tenant.name,
      domain: tenant.domain,
      companyName: tenant.companyName || '',
      contactEmail: tenant.contactEmail || '',
      contactPhone: tenant.contactPhone || '',
      subscriptionPlanId: tenant.subscriptionPlanId?.toString() || '',
      maxUsers: tenant.maxUsers,
      maxProjects: tenant.maxProjects,
      status: tenant.status,
      isIsolated: tenant.isIsolated,
      applicationName: tenant.applicationName || '',
      logoUrl: tenant.logoUrl || '',
    });
    setLogoFile(null);
    setOpen(true);
  };

  const handleSubmit = async () => {
    // debugger;
    try {
      const dataToSubmit = {
        ...formData,
        subscriptionPlanId: formData.subscriptionPlanId ? parseInt(formData.subscriptionPlanId) : undefined,
      };

      let newTenantId = editingTenant?.id;

      if (editingTenant) {
        await tenantApi.updateTenant(editingTenant.id, dataToSubmit);
      } else {
        const created = await tenantApi.createTenant(dataToSubmit as any);
        newTenantId = created.id;
      }

      if (logoFile && newTenantId) {
        await tenantApi.uploadTenantLogo(newTenantId, logoFile);
      }

      await loadTenants();
      handleClose();
    } catch (error) {
      console.error('Error saving tenant:', error);
      setError('Failed to save tenant');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      try {
        await tenantApi.deleteTenant(id);
        await loadTenants();
      } catch (error) {
        console.error('Error deleting tenant:', error);
        setError('Failed to delete tenant');
      }
    }
  };

  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case TenantStatus.Active: return 'success';
      case TenantStatus.Trial: return 'warning';
      case TenantStatus.Suspended: return 'error';
      case TenantStatus.Expired: return 'error';
      case TenantStatus.Cancelled: return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: TenantStatus) => {
    switch (status) {
      case TenantStatus.Active: return '✓';
      case TenantStatus.Trial: return '⏳';
      case TenantStatus.Suspended: return '⏸️';
      case TenantStatus.Expired: return '❌';
      case TenantStatus.Cancelled: return '🚫';
      default: return '?';
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Tenant Management</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Tenant
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tenants
              </Typography>
              <Typography variant="h4">{tenants.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Tenants
              </Typography>
              <Typography variant="h4">
                {tenants.filter(t => t.status === TenantStatus.Active).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Trial Tenants
              </Typography>
              <Typography variant="h4">
                {tenants.filter(t => t.status === TenantStatus.Trial).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Suspended Tenants
              </Typography>
              <Typography variant="h4">
                {tenants.filter(t => t.status === TenantStatus.Suspended).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Domain</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Usage</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  <Typography variant="subtitle2">{tenant.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Created: {new Date(tenant.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={tenant.domain}
                    variant="outlined"
                    size="small"
                    icon={<BusinessIcon />}
                  />
                </TableCell>
                <TableCell>{tenant.companyName || '-'}</TableCell>
                <TableCell>
                  <Typography variant="body2">{tenant.contactEmail || '-'}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {tenant.contactPhone || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${getStatusIcon(tenant.status)} ${tenant.status}`}
                    color={getStatusColor(tenant.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {tenant.subscriptionPlan ? (
                    <Box>
                      <Typography variant="body2">{tenant.subscriptionPlan.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        ${tenant.subscriptionPlan.monthlyPrice}/month
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">No Plan</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Tooltip title={`${tenant.tenantUsers?.length || 0} / ${tenant.maxUsers} Users`}>
                      <Chip
                        label={`${tenant.tenantUsers?.length || 0}/${tenant.maxUsers}`}
                        icon={<PeopleIcon />}
                        size="small"
                        color={tenant.tenantUsers && tenant.tenantUsers.length >= tenant.maxUsers ? 'error' : 'default'}
                      />
                    </Tooltip>
                    <Tooltip title={`${tenant.maxProjects} Projects`}>
                      <Chip
                        label={`${tenant.maxProjects}`}
                        icon={<StorageIcon />}
                        size="small"
                      />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(tenant)} color="primary" size="small" aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <Tooltip title="Manage Users">
                    <IconButton
                      onClick={() => window.location.href = '/admin?section=tenantUsers&tenantId=' + tenant.id}
                      color="secondary"
                      size="small"
                    >
                      <GroupIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={() => handleDelete(tenant.id)} color="error" size="small" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tenant Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Domain"
                name="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="company"
                required
                helperText="This will be used as subdomain (e.g., company.yourdomain.com)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Email"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ height: '56px', justifyContent: 'flex-start', textTransform: 'none' }}
              >
                {logoFile ? logoFile.name : 'Upload Logo Image...'}
                <input
                  type="file"
                  hidden
                  accept="image/jpeg, image/png, image/gif, image/webp, image/svg+xml"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setLogoFile(e.target.files[0]);
                    }
                  }}
                />
              </Button>
              {formData.logoUrl && !logoFile && (
                <Box sx={{ mt: 1 }}>
                  <img src={formData.logoUrl} alt="Current Logo" style={{ maxHeight: 40, objectFit: 'contain' }} />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subscription Plan</InputLabel>
                <Select
                  value={formData.subscriptionPlanId}
                  onChange={(e) => setFormData({ ...formData, subscriptionPlanId: e.target.value })}
                >
                  <MenuItem value="">
                    <em>No Plan</em>
                  </MenuItem>
                  {subscriptionPlans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name} - ${plan.monthlyPrice}/month
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Users"
                name="maxUsers"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Projects"
                name="maxProjects"
                type="number"
                value={formData.maxProjects}
                onChange={(e) => setFormData({ ...formData, maxProjects: parseInt(e.target.value) })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TenantStatus })}
                >
                  <MenuItem value={TenantStatus.Active}>Active</MenuItem>
                  <MenuItem value={TenantStatus.Trial}>Trial</MenuItem>
                  <MenuItem value={TenantStatus.Suspended}>Suspended</MenuItem>
                  <MenuItem value={TenantStatus.Expired}>Expired</MenuItem>
                  <MenuItem value={TenantStatus.Cancelled}>Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isIsolated}
                    onChange={(e) =>
                      setFormData({ ...formData, isIsolated: e.target.checked })
                    }
                  />
                }
                label="Isolated Tenant"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTenant ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantManagement;
