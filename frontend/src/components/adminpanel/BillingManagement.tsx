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
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, PictureAsPdf as PictureAsPdfIcon } from '@mui/icons-material';
import { billingApi, BillingDashboardData, CreateInvoicePayload, TenantOption } from '../../services/billingApi';
import { generateInvoicePdf } from '../../utils/invoicePdfGenerator';

const STATUSES = ['Paid', 'Pending', 'Overdue'];

const defaultForm: CreateInvoicePayload = {
  tenantId: 0,
  invoiceId: '',
  amount: 0,
  status: 'Pending',
  dueDate: new Date().toISOString().split('T')[0],
  paidDate: null,
  paymentId: '',
  receiptUrl: '',
};

const BillingManagement = () => {
  const [billingData, setBillingData] = useState<BillingDashboardData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    invoices: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState<CreateInvoicePayload>(defaultForm);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);
  // Cached tenant list (populated on first open of modal) reused for PDF generation
  const [tenantCache, setTenantCache] = useState<TenantOption[]>([]);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const data = await billingApi.getDashboardData();
      setBillingData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load billing dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleOpenModal = async () => {
    setEditingInvoiceId(null);
    setForm(defaultForm);
    await loadTenants();
    setOpenModal(true);
  };

  const handleOpenEdit = async (invoice: typeof billingData.invoices[0]) => {
    setEditingInvoiceId(invoice.id);
    setForm({
      tenantId: invoice.tenantId,
      invoiceId: invoice.invoiceId,
      amount: invoice.amount,
      status: invoice.status,
      dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
      paidDate: invoice.paidDate ? invoice.paidDate.split('T')[0] : null,
      paymentId: invoice.paymentId || '',
      receiptUrl: invoice.receiptUrl ?? '',
    });
    await loadTenants();
    setOpenModal(true);
  };

  const loadTenants = async () => {
    try {
      console.log('Fetching tenants for billing...');
      const tenantList = await billingApi.getTenants();
      console.log('Fetched tenants:', tenantList);
      setTenants(tenantList);
      setTenantCache(tenantList); // keep a cache for PDF generation
      if (tenantList.length > 0) setForm(f => ({ ...f, tenantId: f.tenantId || tenantList[0].id }));
    } catch (err) {
      console.error('Failed to load tenants:', err);
      showSnackbar('Failed to load tenants.', 'error');
    }
  };

  const handleDownloadPdf = async (invoice: typeof billingData.invoices[0]) => {
    setPdfLoadingId(invoice.id);
    try {
      // Use cached tenants; if not yet loaded, fetch now
      let allTenants = tenantCache;
      if (allTenants.length === 0) {
        allTenants = await billingApi.getTenants();
        setTenantCache(allTenants);
      }
      const tenant = allTenants.find(t => t.id === invoice.tenantId);
      if (!tenant) {
        showSnackbar('Tenant information not found for this invoice.', 'error');
        return;
      }
      await generateInvoicePdf(invoice, tenant);
    } catch (err) {
      console.error('PDF generation failed:', err);
      showSnackbar('Failed to generate PDF. Please try again.', 'error');
    } finally {
      setPdfLoadingId(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.tenantId || form.amount <= 0) {
      showSnackbar('Please fill in all required fields.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        paidDate: form.status === 'Paid' ? (form.paidDate || new Date().toISOString()) : null,
      };
      if (editingInvoiceId !== null) {
        await billingApi.updateInvoice(editingInvoiceId, payload);
        showSnackbar('Invoice updated successfully!', 'success');
      } else {
        await billingApi.createInvoice(payload);
        showSnackbar('Invoice created successfully!', 'success');
      }
      setOpenModal(false);
      await fetchBillingData();
    } catch {
      showSnackbar(editingInvoiceId ? 'Failed to update invoice.' : 'Failed to create invoice.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await billingApi.deleteInvoice(id);
      setDeleteConfirmId(null);
      showSnackbar('Invoice deleted successfully.', 'success');
      await fetchBillingData();
    } catch {
      showSnackbar('Failed to delete invoice.', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Billing Management</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{ textTransform: 'none' }}
          >
            Create Invoice
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Total Revenue', value: billingData.totalRevenue, color: 'text.primary' },
          { label: 'Monthly Revenue', value: billingData.monthlyRevenue, color: 'text.primary' },
          { label: 'Pending Payments', value: billingData.pendingPayments, color: 'warning.main' },
          { label: 'Overdue Payments', value: billingData.overduePayments, color: 'error.main' },
        ].map(({ label, value, color }) => (
          <Grid item xs={12} md={3} key={label}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>{label}</Typography>
                <Typography variant="h4" color={color}>
                  ₹{value.toLocaleString('en-IN')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Invoice Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Invoice ID</strong></TableCell>
              <TableCell><strong>Tenant</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Paid Date</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {billingData.invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No invoices found. Click "Create Invoice" to add one.
                </TableCell>
              </TableRow>
            ) : (
              billingData.invoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>{invoice.invoiceId || `#${invoice.id}`}</TableCell>
                  <TableCell>{invoice.tenantName}</TableCell>
                  <TableCell>₹{invoice.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell>
                    {invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString('en-IN') : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Download PDF Invoice">
                      <span>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleDownloadPdf(invoice)}
                          disabled={pdfLoadingId === invoice.id}
                        >
                          {pdfLoadingId === invoice.id
                            ? <CircularProgress size={16} color="inherit" />
                            : <PictureAsPdfIcon fontSize="small" />}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Edit Invoice">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEdit(invoice)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Invoice">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteConfirmId(invoice.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          Real-time billing data synchronized via Razorpay Webhooks. You can also create manual invoices.
        </Alert>
      </Box>

      {/* ── Create Invoice Modal ── */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingInvoiceId !== null ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <FormControl fullWidth required>
            <InputLabel id="tenant-label">Tenant</InputLabel>
            <Select
              labelId="tenant-label"
              label="Tenant"
              value={form.tenantId}
              onChange={e => setForm(f => ({ ...f, tenantId: Number(e.target.value) }))}
            >
              {tenants.map(t => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Invoice ID (optional)"
            value={form.invoiceId}
            onChange={e => setForm(f => ({ ...f, invoiceId: e.target.value }))}
            helperText="Leave blank to auto-generate"
            fullWidth
          />

          <TextField
            label="Amount (₹)"
            type="number"
            required
            value={form.amount || ''}
            onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
            inputProps={{ min: 0, step: 0.01 }}
            fullWidth
          />

          <FormControl fullWidth required>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              {STATUSES.map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Due Date"
            type="date"
            required
            value={form.dueDate}
            onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {form.status === 'Paid' && (
            <TextField
              label="Paid Date"
              type="date"
              value={form.paidDate ?? new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, paidDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          )}

          <TextField
            label="Payment ID (optional)"
            value={form.paymentId}
            onChange={e => setForm(f => ({ ...f, paymentId: e.target.value }))}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenModal(false)} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {submitting ? 'Saving...' : (editingInvoiceId !== null ? 'Update Invoice' : 'Create Invoice')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Modal ── */}
      <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this invoice? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BillingManagement;
