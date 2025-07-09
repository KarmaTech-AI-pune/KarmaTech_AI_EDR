import React, { useEffect, useMemo } from 'react';
import { Controller, useFormContext, Control, FieldPath } from 'react-hook-form';
import { MonthlyProgressSchemaType } from '../../../../schemas/monthlyProgress/MonthlyProgressSchema';
import { getPercentage } from '../../../../utils/calculations';
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

interface BudgetTextFieldProps {
  name: FieldPath<MonthlyProgressSchemaType>;
  control: Control<MonthlyProgressSchemaType>;
  placeholder: string;
  readOnly?: boolean;
  endAdornment?: string;
}

const BudgetTextField: React.FC<BudgetTextFieldProps> = ({
  name,
  control,
  placeholder,
  readOnly = false,
  endAdornment,
}) => {
  const { formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();

  const getNestedError = (path: string, obj: any) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const error = getNestedError(name, errors);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          size="small"
          type="number"
          placeholder={placeholder}
          value={field.value ?? 0}
          onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          error={!!error}
          helperText={error?.message || ''}
          sx={readOnly ? {} : textFieldStyle}
          InputProps={{
            readOnly,
            endAdornment,
          }}
        />
      )}
    />
  );
};

const BudgetRevenueTab: React.FC = () => {
  const { control, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

  const misRevenue = watch('budgetTable.currentBudgetInMIS.revenueFee');
  const misCost = watch('budgetTable.currentBudgetInMIS.cost');
  const totalPaymentDue = watch('progressDeliverable.totalPaymentDue');
  const totalCumulativeActualCost = watch('actualCost.totalCumulativeCost');
  

  const calculatedPercentages = useMemo(() => {
    const revenuePercentage = misRevenue && totalPaymentDue ? getPercentage(totalPaymentDue, misRevenue) : 0;
    const costPercentage = misCost && totalCumulativeActualCost ? getPercentage(totalCumulativeActualCost, misCost) : 0;
    return { revenuePercentage, costPercentage };
  }, [misRevenue, misCost, totalPaymentDue, totalCumulativeActualCost]);

  useEffect(() => {
    setValue('budgetTable.percentCompleteOnCosts.revenueFee', calculatedPercentages.revenuePercentage);
    setValue('budgetTable.percentCompleteOnCosts.cost', calculatedPercentages.costPercentage);
  }, [calculatedPercentages, setValue]);

  const budgetFields = {
    original: {
      revenueFee: "budgetTable.originalBudget.revenueFee" as const,
      cost: "budgetTable.originalBudget.cost" as const,
      profit: "budgetTable.originalBudget.profitPercentage" as const,
    },
    current: {
      revenueFee: "budgetTable.currentBudgetInMIS.revenueFee" as const,
      cost: "budgetTable.currentBudgetInMIS.cost" as const,
      profit: "budgetTable.currentBudgetInMIS.profitPercentage" as const,
    },
    percentComplete: {
      revenueFee: "budgetTable.percentCompleteOnCosts.revenueFee" as const,
      cost: "budgetTable.percentCompleteOnCosts.cost" as const,
    },
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
              <TableRow>
                <TableCell sx={{ fontWeight: 500, backgroundColor: '#f9f9f9' }}>
                  Original Budget
                </TableCell>
                <TableCell>
                  <BudgetTextField name={budgetFields.original.revenueFee} control={control} placeholder="Revenue/Fee" readOnly />
                </TableCell>
                <TableCell>
                  <BudgetTextField name={budgetFields.original.cost} control={control} placeholder="Cost" readOnly />
                </TableCell>
                <TableCell>
                  <BudgetTextField name={budgetFields.original.profit} control={control} placeholder="Profit(%)" readOnly endAdornment="%" />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ fontWeight: 500, backgroundColor: '#f9f9f9' }}>
                  Current Budget in MIS
                </TableCell>
                <TableCell>
                  <BudgetTextField name={budgetFields.current.revenueFee} control={control} placeholder="Revenue/Fee" readOnly />
                </TableCell>
                <TableCell>
                  <BudgetTextField name={budgetFields.current.cost} control={control} placeholder="Cost" readOnly />
                </TableCell>
                <TableCell>
                  <BudgetTextField name={budgetFields.current.profit} control={control} placeholder="Profit(%)" readOnly endAdornment="%" />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ fontWeight: 500, backgroundColor: '#f9f9f9' }}>
                  % Complete on costs:
                </TableCell>
                <TableCell>
                  <BudgetTextField name={budgetFields.percentComplete.revenueFee} control={control} placeholder="Revenue/Fee %" readOnly endAdornment="%" />
                </TableCell>
                <TableCell>
                  <BudgetTextField name={budgetFields.percentComplete.cost} control={control} placeholder="Cost %" readOnly endAdornment="%" />
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default BudgetRevenueTab;
