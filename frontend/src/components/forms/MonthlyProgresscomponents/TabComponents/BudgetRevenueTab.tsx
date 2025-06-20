import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { MonthlyProgressSchemaType } from '../../../../schemas/monthlyProgress/MonthlyProgressSchema';
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
  const { control, formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();

  // Common text field styles following the application pattern
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      backgroundColor: '#fff',
      '&:hover fieldset': {
        borderColor: '#1869DA',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1869DA',
      }
    },
    // Hide number input arrows
    '& input[type=number]': {
      '-moz-appearance': 'textfield',
    },
    '& input[type=number]::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '& input[type=number]::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    }
  };

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
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        error={!!errors.budgetTable?.originalBudget?.revenueFee}
                        helperText={errors.budgetTable?.originalBudget?.revenueFee?.message}
                        sx={textFieldStyle}
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
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        error={!!errors.budgetTable?.originalBudget?.cost}
                        helperText={errors.budgetTable?.originalBudget?.cost?.message}
                        sx={textFieldStyle}
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
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        error={!!errors.budgetTable?.originalBudget?.profitPercentage}
                        helperText={errors.budgetTable?.originalBudget?.profitPercentage?.message}
                        sx={textFieldStyle}
                        InputProps={{
                          endAdornment: '%'
                        }}
                      />
                    )}
                  />
                </TableCell>
              </TableRow>

              {/* Current Budget in IMS Row */}
              <TableRow>
                <TableCell sx={{ fontWeight: 500, backgroundColor: '#f9f9f9' }}>
                  Current Budget in IMS
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
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        error={!!errors.budgetTable?.currentBudgetInMIS?.revenueFee}
                        helperText={errors.budgetTable?.currentBudgetInMIS?.revenueFee?.message}
                        sx={textFieldStyle}
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
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        error={!!errors.budgetTable?.currentBudgetInMIS?.cost}
                        helperText={errors.budgetTable?.currentBudgetInMIS?.cost?.message}
                        sx={textFieldStyle}
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
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        error={!!errors.budgetTable?.currentBudgetInMIS?.profitPercentage}
                        helperText={errors.budgetTable?.currentBudgetInMIS?.profitPercentage?.message}
                        sx={textFieldStyle}
                        InputProps={{
                          endAdornment: '%'
                        }}
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
                          endAdornment: '%'
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name="budgetTable.percentCompleteOnCosts.profitPercentage"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Profit %"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        error={!!errors.budgetTable?.percentCompleteOnCosts?.profitPercentage}
                        helperText={errors.budgetTable?.percentCompleteOnCosts?.profitPercentage?.message}
                        sx={textFieldStyle}
                        InputProps={{
                          endAdornment: '%'
                        }}
                      />
                    )}
                  />
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
