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
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import WarningIcon from '@mui/icons-material/Warning';

const BillingManagement = () => {
  const [billingData, setBillingData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    invoices: []
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for now - replace with actual API call
    setBillingData({
      totalRevenue: 125000,
      monthlyRevenue: 15000,
      pendingPayments: 2500,
      overduePayments: 800,
      invoices: [
        {
          id: 1,
          tenantName: 'Acme Corp',
          amount: 500,
          status: 'Paid',
          dueDate: '2024-01-15',
          paidDate: '2024-01-10'
        },
        {
          id: 2,
          tenantName: 'TechStart Inc',
          amount: 750,
          status: 'Pending',
          dueDate: '2024-01-20',
          paidDate: null
        },
        {
          id: 3,
          tenantName: 'Global Solutions',
          amount: 1200,
          status: 'Overdue',
          dueDate: '2024-01-05',
          paidDate: null
        }
      ]
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Billing Management</Typography>
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
                Total Revenue
              </Typography>
              <Typography variant="h4">
                ${billingData.totalRevenue.toLocaleString()}
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
                ${billingData.monthlyRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Payments
              </Typography>
              <Typography variant="h4">
                ${billingData.pendingPayments.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Overdue Payments
              </Typography>
              <Typography variant="h4" color="error">
                ${billingData.overduePayments.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice ID</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Paid Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {billingData.invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>#{invoice.id}</TableCell>
                <TableCell>{invoice.tenantName}</TableCell>
                <TableCell>${invoice.amount}</TableCell>
                <TableCell>
                  <Chip 
                    label={invoice.status} 
                    color={getStatusColor(invoice.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          <Typography variant="body2">
            This is a simplified billing view. In a production environment, this would integrate with 
            Stripe, PayPal, or other payment processors to show real-time billing data.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default BillingManagement; 