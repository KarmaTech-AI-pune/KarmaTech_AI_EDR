/**
 * PaymentScheduleTable Component
 * Displays payment milestones with description, percentage, and totals in INR
 */

import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { PaymentScheduleData, PaymentMilestone } from '../types/cashflow';
import { AddPaymentScheduleDialog } from './AddPaymentScheduleDialog';

interface PaymentScheduleTableProps {
  data?: PaymentScheduleData;
  onAddMilestone?: (milestone: Omit<PaymentMilestone, 'id'>) => void;
}

export const PaymentScheduleTable: React.FC<PaymentScheduleTableProps> = ({ 
  data,
  onAddMilestone,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Debug: Log data changes
  React.useEffect(() => {
    console.log('=== PaymentScheduleTable: Data prop changed ===');
    console.log('Full data object:', JSON.stringify(data, null, 2));
    console.log('Milestones array:', data?.milestones);
    console.log('Milestones count:', data?.milestones?.length || 0);
    console.log('Total percentage:', data?.totalPercentage);
    console.log('Total amount INR:', data?.totalAmountINR);
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const milestones = data?.milestones || [];
  const totalPercentage = data?.totalPercentage || 0;
  const totalAmountINR = data?.totalAmountINR || 0;
  const totalProjectFee = data?.totalProjectFee || 0;

  console.log('=== PaymentScheduleTable: Rendering ===');
  console.log('Milestones to render:', milestones.length);
  console.log('First milestone:', milestones[0]);

  const handleAddMilestone = (milestone: Omit<PaymentMilestone, 'id'>) => {
    console.log('PaymentScheduleTable: handleAddMilestone called:', milestone);
    if (onAddMilestone) {
      onAddMilestone(milestone);
    }
    setDialogOpen(false);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3,
        }}
      >
        {/* Table Title with Add Button */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#fafafa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Payment Schedule
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
          >
            Add Payment Schedule
          </Button>
        </Box>

      {/* Table */}
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: '#f9fafb',
              }}
            >
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 2,
                  px: 3,
                  width: '40%',
                }}
              >
                Description
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 2,
                  px: 3,
                  width: '15%',
                }}
              >
                Percentage
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 2,
                  px: 3,
                  width: '20%',
                }}
              >
                Totals in INR
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 2,
                  px: 3,
                  width: '25%',
                }}
              >
                Due Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {milestones.length > 0 ? (
              <>
                {milestones.map((milestone, index) => (
                  <TableRow
                    key={milestone.id || index}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f9fafb',
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontSize: '0.875rem',
                        color: '#374151',
                        py: 2,
                        px: 3,
                      }}
                    >
                      {milestone.description}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontSize: '0.875rem',
                        color: '#374151',
                        py: 2,
                        px: 3,
                        fontFamily: 'monospace',
                      }}
                    >
                      {milestone.percentage}%
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontSize: '0.875rem',
                        color: '#374151',
                        py: 2,
                        px: 3,
                        fontFamily: 'monospace',
                      }}
                    >
                      {formatCurrency(milestone.amountINR)}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: '0.875rem',
                        color: '#374151',
                        py: 2,
                        px: 3,
                      }}
                    >
                      {milestone.dueDate 
                        ? new Date(milestone.dueDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Total Row */}
                <TableRow
                  sx={{
                    backgroundColor: '#f3f4f6',
                    borderTop: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  <TableCell
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#111827',
                      py: 2,
                      px: 3,
                    }}
                  >
                    Total
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#111827',
                      py: 2,
                      px: 3,
                      fontFamily: 'monospace',
                    }}
                  >
                    {totalPercentage}%
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#111827',
                      py: 2,
                      px: 3,
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatCurrency(totalAmountINR)}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#111827',
                      py: 2,
                      px: 3,
                    }}
                  >
                    -
                  </TableCell>
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#9ca3af' }}>
                  No payment schedule data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>

    {/* Add Payment Schedule Dialog */}
    <AddPaymentScheduleDialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      onAdd={handleAddMilestone}
      totalAmountINR={totalProjectFee}
      currentTotalPercentage={totalPercentage}
    />
  </>
  );
};
