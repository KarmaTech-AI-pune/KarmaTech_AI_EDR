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
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
  CircularProgress,
  Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import StorageIcon from '@mui/icons-material/Storage';
import * as subscriptionApi from '../../services/subscriptionApi';
import { SubscriptionPlan, Feature } from '../../models/subscriptionModel';

const SubscriptionManagement = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
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
    featureIds: [] as number[],
    isActive: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedPlans, fetchedFeatures] = await Promise.all([
        subscriptionApi.getSubscriptionPlans(),
        subscriptionApi.getAllFeatures()
      ]);
      setPlans(fetchedPlans || []);
      setAvailableFeatures(fetchedFeatures || []);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
      try {
        const fetchedPlans = await subscriptionApi.getSubscriptionPlans();
        setPlans(fetchedPlans || []);
      } catch (error) {
        console.error('Error loading subscription plans:', error);
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
      featureIds: [],
      isActive: true
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
      featureIds: plan.features ? plan.features.map((f) => f.id) : [],
      isActive: plan.isActive
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      let planId: number;

      if (editingPlan) {
        // 1. Update basic plan details
        await subscriptionApi.updateSubscriptionPlan(editingPlan.id, { 
            id: editingPlan.id,
            ...formData 
        });
        planId = editingPlan.id;

        // 2. Handle Feature Changes
        const originalFeatureIds = editingPlan.features ? editingPlan.features.map(f => f.id) : [];
        const newFeatureIds = formData.featureIds;

        // Features to Add
        const toAdd = newFeatureIds.filter(id => !originalFeatureIds.includes(id));
        // Features to Remove
        const toRemove = originalFeatureIds.filter(id => !newFeatureIds.includes(id));

        // Execute additions
        await Promise.all(toAdd.map(featureId => subscriptionApi.addFeatureToPlan(planId, featureId)));
        
        // Execute removals
        await Promise.all(toRemove.map(featureId => subscriptionApi.removeFeatureFromPlan(planId, featureId)));

      } else {
        // 1. Create the plan
        const newPlan = await subscriptionApi.createSubscriptionPlan(formData);
        planId = newPlan.id;

        // 2. Add all selected features
        if (formData.featureIds.length > 0) {
             await Promise.all(formData.featureIds.map(featureId => subscriptionApi.addFeatureToPlan(planId, featureId)));
        }
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

  const handleFeatureToggle = (featureId: number) => {
    setFormData(prev => {
        const currentIds = prev.featureIds;
        const newIds = currentIds.includes(featureId)
            ? currentIds.filter(id => id !== featureId)
            : [...currentIds, featureId];
        return { ...prev, featureIds: newIds };
    });
  };

  const calculateMonthlyRevenue = () => {
    return plans.reduce((sum, plan) => {
      const subscribers = plan.tenants?.length || 0;
      return sum + (plan.monthlyPrice * subscribers);
    }, 0);
  };

  if (loading) {
      return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

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
                    {plan.features?.map((feature) => (
                        <Tooltip key={feature.id} title={feature.description || feature.name}>
                            <Chip label={feature.name} size="small" color="primary" />
                        </Tooltip>
                    ))}
                    {(!plan.features || plan.features.length === 0) && (
                        <Typography variant="caption" color="textSecondary">No features</Typography>
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
            <Grid item xs={12} md={4}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                    }
                    label="Active"
                />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
            </Grid>
            {availableFeatures.map((feature) => (
                <Grid item xs={12} md={6} key={feature.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.featureIds.includes(feature.id)}
                        onChange={() => handleFeatureToggle(feature.id)}
                      />
                    }
                    label={
                        <Tooltip title={feature.description}>
                            <Typography>{feature.name}</Typography>
                        </Tooltip>
                    }
                  />
                </Grid>
            ))}
             {availableFeatures.length === 0 && (
                 <Grid item xs={12}>
                     <Typography color="textSecondary" variant="body2">No features available. Please add features in the Feature Management section.</Typography>
                 </Grid>
             )}
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
