import React, { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { MonthlyProgressSchemaType } from '../../../../schemas/monthlyProgress/MonthlyProgressSchema';
import { calculatePercentageComplete } from '../../../../utils/calculations';
import textFieldStyle from '../../../../theme/textFieldStyle';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Typography
} from '@mui/material';

const BudgetRevenueTab: React.FC = () => {
  const { control, formState: { errors }, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

  const misRevenue = watch('budgetTable.currentBudgetInMIS.revenueFee');
  const misCost = watch('budgetTable.currentBudgetInMIS.cost');
  const totalPaymentDue = watch('progressDeliverable.totalPaymentDue');

  useEffect(() => {
    if (misRevenue && totalPaymentDue) {
      const percentage = calculatePercentageComplete(totalPaymentDue, misRevenue);
      setValue('budgetTable.percentCompleteOnCosts.revenueFee', percentage);
    } else {
      setValue('budgetTable.percentCompleteOnCosts.revenueFee', 0);
    }
  }, [misRevenue, totalPaymentDue, setValue]);

  useEffect(() => {
    if (misCost && totalPaymentDue) {
      const percentage = calculatePercentageComplete(totalPaymentDue, misCost);
      setValue('budgetTable.percentCompleteOnCosts.cost', percentage);
    } else {
      setValue('budgetTable.percentCompleteOnCosts.cost', 0);
    }
  }, [misCost, totalPaymentDue, setValue]);


  return (
    <Box>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="primary">
            Budget Revenue
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ '& .MuiTableCell-root': { border: '1px solid #e0e0e0' } }}>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 600, backgroundColor: '#f5f5f5' } }}>
                <TableCell></TableCell>
                <TableCell align="center">Revenue/Fee</TableCell>
                <TableCell align="center">Cost</TableCell>
                <TableCell align="center">Profit(%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Original Budget Row */}
              <TableRow>
                <TableCell sx={{ fontWeight: 500, backgroundColor: '#f9f9f9' }}>
                  Original Budget
                </TableCell>
                <TableCell>
                  <Controller
                    name="budgetTable.originalBudget.revenueFee"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Revenue/Fee"
                        value={field.value || ''}
                        error={!!errors.budgetTable?.originalBudget?.revenueFee}
                        helperText={errors.budgetTable?.originalBudget?.revenueFee?.message}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name="budgetTable.originalBudget.cost"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Cost"
                        value={field.value || ''}
                        InputProps={{
                          readOnly: true,
                        }}
                        error={!!errors.budgetTable?.originalBudget?.cost}
                        helperText={errors.budgetTable?.originalBudget?.cost?.message}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name="budgetTable.originalBudget.profitPercentage"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Profit(%)"
                        value={field.value || ''}
                        InputProps={{
                          readOnly: true,
                          endAdornment: '%'
                        }}
                        error={!!errors.budgetTable?.originalBudget?.profitPercentage}
                        helperText={errors.budgetTable?.originalBudget?.profitPercentage?.message}
                      />
                    )}
                  />
                </TableCell>
              </TableRow>

              {/* Current Budget in IMS Row */}
              <TableRow>
                <TableCell sx={{ fontWeight: 500, backgroundColor: '#f9f9f9' }}>
                  Current Budget in MIS
                </TableCell>
                <TableCell>
                  <Controller
                    name="budgetTable.currentBudgetInMIS.revenueFee"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Revenue/Fee"
                        value={field.value || ''}
                        InputProps={{
                          readOnly: true,
                        }}
                        error={!!errors.budgetTable?.currentBudgetInMIS?.revenueFee}
                        helperText={errors.budgetTable?.currentBudgetInMIS?.revenueFee?.message}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name="budgetTable.currentBudgetInMIS.cost"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Cost"
                        value={field.value || ''}
                        InputProps={{
                          readOnly: true,
                        }}
                        error={!!errors.budgetTable?.currentBudgetInMIS?.cost}
                        helperText={errors.budgetTable?.currentBudgetInMIS?.cost?.message}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name="budgetTable.currentBudgetInMIS.profitPercentage"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Profit(%)"
                        value={field.value || ''}
                        InputProps={{
                          readOnly: true,
                          endAdornment: '%'
                        }}
                        error={!!errors.budgetTable?.currentBudgetInMIS?.profitPercentage}
                        helperText={errors.budgetTable?.currentBudgetInMIS?.profitPercentage?.message}
                      />
                    )}
                  />
                </TableCell>
              </TableRow>

              {/* % Complete on costs Row */}
              <TableRow>
                <TableCell sx={{ fontWeight: 500, backgroundColor: '#f9f9f9' }}>
                  % Complete on costs:
                </TableCell>
                <TableCell>
                  <Controller
                    name="budgetTable.percentCompleteOnCosts.revenueFee"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Revenue/Fee %"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        error={!!errors.budgetTable?.percentCompleteOnCosts?.revenueFee}
                        helperText={errors.budgetTable?.percentCompleteOnCosts?.revenueFee?.message}
                        sx={textFieldStyle}
                        InputProps={{
                          readOnly: true,
                          endAdornment: '%'
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name="budgetTable.percentCompleteOnCosts.cost"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Cost %"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        error={!!errors.budgetTable?.percentCompleteOnCosts?.cost}
                        helperText={errors.budgetTable?.percentCompleteOnCosts?.cost?.message}
                        sx={textFieldStyle}
                        InputProps={{
                          readOnly: true,
                          endAdornment: '%'
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default BudgetRevenueTab;
