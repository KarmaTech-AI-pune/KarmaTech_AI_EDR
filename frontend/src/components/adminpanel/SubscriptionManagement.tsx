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
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import StorageIcon from '@mui/icons-material/Storage';
import * as subscriptionApi from '../../services/subscriptionApi';
import { SubscriptionPlan, PlanFeatures } from '../../models/subscriptionModel';

const SubscriptionManagement = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [open, setOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxUsers: 10,
    maxProjects: 50,
    maxStorageGB: 10,
    features: {
      advancedReporting: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      whiteLabel: false,
      sso: false,
    },
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const fetchedPlans = await subscriptionApi.getSubscriptionPlans();
      setPlans(fetchedPlans);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      setError('Failed to load subscription plans');
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      monthlyPrice: 0,
      yearlyPrice: 0,
      maxUsers: 10,
      maxProjects: 50,
      maxStorageGB: 10,
      features: {
        advancedReporting: false,
        customBranding: false,
        apiAccess: false,
        prioritySupport: false,
        whiteLabel: false,
        sso: false,
      },
    });
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPlan(null);
    setError(null);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      maxUsers: plan.maxUsers,
      maxProjects: plan.maxProjects,
      maxStorageGB: plan.maxStorageGB,
      features: plan.features || {
        advancedReporting: false,
        customBranding: false,
        apiAccess: false,
        prioritySupport: false,
        whiteLabel: false,
        sso: false,
      },
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingPlan) {
        await subscriptionApi.updateSubscriptionPlan(editingPlan.id, formData);
      } else {
        await subscriptionApi.createSubscriptionPlan(formData);
      }
      await loadPlans();
      handleClose();
    } catch (error) {
      console.error('Error saving subscription plan:', error);
      setError('Failed to save subscription plan');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this subscription plan? This action cannot be undone.')) {
      try {
        await subscriptionApi.deleteSubscriptionPlan(id);
        await loadPlans();
      } catch (error) {
        console.error('Error deleting subscription plan:', error);
        setError('Failed to delete subscription plan');
      }
    }
  };

  const calculateMonthlyRevenue = () => {
    return plans.reduce((sum, plan) => {
      const subscribers = plan.tenants?.length || 0;
      return sum + (plan.monthlyPrice * subscribers);
    }, 0);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Subscription Plans</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Plan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Plans
              </Typography>
              <Typography variant="h4">{plans.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Plans
              </Typography>
              <Typography variant="h4">
                {plans.filter(p => p.isActive).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Subscribers
              </Typography>
              <Typography variant="h4">
                {plans.reduce((sum, plan) => sum + (plan.tenants?.length || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Monthly Revenue
              </Typography>
              <Typography variant="h4">
                ${calculateMonthlyRevenue().toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plan Name</TableCell>
              <TableCell>Pricing</TableCell>
              <TableCell>Limits</TableCell>
              <TableCell>Features</TableCell>
              <TableCell>Subscribers</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <Typography variant="h6">{plan.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {plan.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      Monthly: ${plan.monthlyPrice}
                    </Typography>
                    <Typography variant="body2">
                      Yearly: ${plan.yearlyPrice}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    <Chip label={`${plan.maxUsers} Users`} size="small" icon={<PeopleIcon />} />
                    <Chip label={`${plan.maxProjects} Projects`} size="small" icon={<StorageIcon />} />
                    <Chip label={`${plan.maxStorageGB}GB Storage`} size="small" />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {plan.features?.advancedReporting && (
                      <Tooltip title="Advanced Reporting">
                        <Chip label="Advanced Reporting" size="small" color="primary" />
                      </Tooltip>
                    )}
                    {plan.features?.customBranding && (
                      <Tooltip title="Custom Branding">
                        <Chip label="Custom Branding" size="small" color="primary" />
                      </Tooltip>
                    )}
                    {plan.features?.apiAccess && (
                      <Tooltip title="API Access">
                        <Chip label="API Access" size="small" color="primary" />
                      </Tooltip>
                    )}
                    {plan.features?.prioritySupport && (
                      <Tooltip title="Priority Support">
                        <Chip label="Priority Support" size="small" color="primary" />
                      </Tooltip>
                    )}
                    {plan.features?.whiteLabel && (
                      <Tooltip title="White Label">
                        <Chip label="White Label" size="small" color="primary" />
                      </Tooltip>
                    )}
                    {plan.features?.sso && (
                      <Tooltip title="Single Sign-On">
                        <Chip label="SSO" size="small" color="primary" />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="h6">{plan.tenants?.length || 0}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    subscribers
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={plan.isActive ? 'Active' : 'Inactive'} 
                    color={plan.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(plan)} color="primary" size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(plan.id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPlan ? 'Edit Subscription Plan' : 'Add New Subscription Plan'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Plan Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Price ($)"
                name="monthlyPrice"
                type="number"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) })}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Yearly Price ($)"
                name="yearlyPrice"
                type="number"
                value={formData.yearlyPrice}
                onChange={(e) => setFormData({ ...formData, yearlyPrice: parseFloat(e.target.value) })}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Users"
                name="maxUsers"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Projects"
                name="maxProjects"
                type="number"
                value={formData.maxProjects}
                onChange={(e) => setFormData({ ...formData, maxProjects: parseInt(e.target.value) })}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Storage (GB)"
                name="maxStorageGB"
                type="number"
                value={formData.maxStorageGB}
                onChange={(e) => setFormData({ ...formData, maxStorageGB: parseInt(e.target.value) })}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.features.advancedReporting}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, advancedReporting: e.target.checked }
                    })}
                  />
                }
                label="Advanced Reporting"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.features.customBranding}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, customBranding: e.target.checked }
                    })}
                  />
                }
                label="Custom Branding"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.features.apiAccess}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, apiAccess: e.target.checked }
                    })}
                  />
                }
                label="API Access"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.features.prioritySupport}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, prioritySupport: e.target.checked }
                    })}
                  />
                }
                label="Priority Support"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.features.whiteLabel}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, whiteLabel: e.target.checked }
                    })}
                  />
                }
                label="White Label"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.features.sso}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, sso: e.target.checked }
                    })}
                  />
                }
                label="Single Sign-On (SSO)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPlan ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionManagement; 