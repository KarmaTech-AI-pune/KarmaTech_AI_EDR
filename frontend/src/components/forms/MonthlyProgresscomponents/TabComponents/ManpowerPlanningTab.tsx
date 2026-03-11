import React, { useEffect, useMemo } from "react";
import { Controller, useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import textFieldStyle from "../../../../theme/textFieldStyle";
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
  Typography,
} from "@mui/material";

// Reusable Cell Component
const EditableTableCell: React.FC<{
  name: string;
  index: number;
  placeholder: string;
  isReadOnly?: boolean;
  align?: 'center' | 'left' | 'right';
  type?: string;
}> = ({ name, index, placeholder, isReadOnly = false, align = 'left', type = 'text' }) => {
  const { control, formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();
  const fieldName = `manpowerPlanning.manpower.${index}.${name}`;

  const getNestedError = (name: string, index: number) => {
    if (!errors.manpowerPlanning?.manpower?.[index]) {
      return null;
    }
    const fieldError = errors.manpowerPlanning.manpower[index];
    return fieldError ? fieldError[name as keyof typeof fieldError] : null;
  };

  const error = getNestedError(name, index);

  return (
    <TableCell align={align}>
      <Controller
        name={fieldName as any}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            size="small"
            type={type}
            placeholder={placeholder}
            value={field.value ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              if (type === 'number') {
                field.onChange(value ? Number(value) : null);
              } else {
                field.onChange(value);
              }
            }}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            error={!!error}
            helperText={error && typeof error === 'object' && 'message' in error ? error.message : ''}
            sx={{
              ...textFieldStyle,
              ...(isReadOnly && {
                '& .MuiOutlinedInput-root': {
                  ...(textFieldStyle?.['& .MuiOutlinedInput-root']
                    ? textFieldStyle['& .MuiOutlinedInput-root']
                    : {}),
                  backgroundColor: '#f9f9f9',
                },
              }),
            }}
            InputProps={{
              readOnly: isReadOnly,
            }}
            inputProps={{ min: 0, step: "any" }}
          />
        )}
      />
    </TableCell>
  );
};

// Column Configuration
const tableColumns = [
  { name: "workAssignment", label: "Work Assignment", placeholder: "Work Assignment", isReadOnly: true },
  { name: "assignee", label: "Assignee", placeholder: "Assignee", isReadOnly: true, minWidth: 150 },
  { name: "rate", label: "Rate", placeholder: "Rate", type: "number", align: "center", isReadOnly: true, minWidth: 100 },
  { name: "planned", label: "Planned", placeholder: "Planned", type: "number", align: "center", isReadOnly: true },
  { name: "consumed", label: "Consumed", placeholder: "Consumed", type: "number", align: "center" },
  { name: "payment", label: "Payment", placeholder: "Payment", type: "number", align: "center", isReadOnly: true, minWidth: 120 },
  { name: "balance", label: "Balance", placeholder: "Balance", type: "number", align: "center", isReadOnly: true },
  { name: "nextMonthPlanning", label: "Next Month Planning", placeholder: "Next Month", type: "number", align: "center", isReadOnly: true },
  { name: "manpowerComments", label: "Comments", placeholder: "Comments" },
];

const ManpowerPlanningTab: React.FC = () => {
  const { control, setValue } = useFormContext<MonthlyProgressSchemaType>();

  const { fields } = useFieldArray({
    control,
    name: "manpowerPlanning.manpower"
  });

  const manpowerEntries = useWatch({
    control,
    name: "manpowerPlanning.manpower"
  });

  const totals = useMemo(() => {
    if (!manpowerEntries || manpowerEntries.length === 0) {
      return {
        plannedTotal: 0,
        consumedTotal: 0,
        paymentTotal: 0,
        balanceTotal: 0,
        nextMonthPlanningTotal: 0
      };
    }

    const plannedTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.planned || 0), 0);
    const consumedTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.consumed || 0), 0);
    const paymentTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.payment || 0), 0);
    const balanceTotal = plannedTotal - consumedTotal;
    const nextMonthPlanningTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.nextMonthPlanning || 0), 0);

    return {
      plannedTotal,
      consumedTotal,
      paymentTotal,
      balanceTotal,
      nextMonthPlanningTotal
    };
  }, [manpowerEntries]);

  useEffect(() => {
    if (!manpowerEntries) return;

    const newTotals = manpowerEntries.reduce(
      (acc, entry) => {
        acc.plannedTotal += entry.planned || 0;
        acc.consumedTotal += entry.consumed || 0;
        acc.paymentTotal += entry.payment || 0;
        acc.nextMonthPlanningTotal += entry.nextMonthPlanning || 0;
        return acc;
      },
      { plannedTotal: 0, consumedTotal: 0, paymentTotal: 0, nextMonthPlanningTotal: 0 }
    );

    const balanceTotal = newTotals.plannedTotal - newTotals.consumedTotal;

    // Use setTimeout to break the infinite loop by deferring setState
    const timeoutId = setTimeout(() => {
      setValue("manpowerPlanning.manpowerTotal", {
        ...newTotals,
        balanceTotal,
      }, { shouldValidate: false, shouldDirty: false });

      // Update actualCost.actualStaff with the total payment
      setValue("actualCost.actualStaff", newTotals.paymentTotal, { shouldValidate: false, shouldDirty: false });

      manpowerEntries.forEach((entry, index) => {
        const planned = entry.planned || 0;
        const consumed = entry.consumed || 0;
        const rate = entry.rate || 0;
        const balance = planned - consumed;
        const payment = rate * consumed;
        
        if (entry.balance !== balance) {
          setValue(`manpowerPlanning.manpower.${index}.balance`, balance, { shouldValidate: false, shouldDirty: false });
        }
        if (entry.payment !== payment) {
          setValue(`manpowerPlanning.manpower.${index}.payment`, payment, { shouldValidate: false, shouldDirty: false });
        }
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [manpowerEntries, setValue]);

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary">
            Manpower Planning
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 600, backgroundColor: '#f5f5f5', border: 'none' } }}>
                {tableColumns.map(col => (
                  <TableCell key={col.name} align={(col.align || 'left') as any} sx={{ minWidth: col.minWidth }}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id} sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
                  {tableColumns.map(col => (
                    <EditableTableCell
                      key={col.name}
                      name={col.name}
                      index={index}
                      placeholder={col.placeholder}
                      isReadOnly={col.isReadOnly}
                      align={col.align as any}
                      type={col.type}
                    />
                  ))}
                </TableRow>
              ))}

              <TableRow sx={{
                backgroundColor: '#f5f5f5',
                '& .MuiTableCell-root': {
                  fontWeight: 600,
                  border: 'none'
                }
              }}>
                <TableCell>
                  <Typography variant="subtitle2">TOTAL</Typography>
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2">
                    {totals.plannedTotal}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2">
                    {totals.consumedTotal}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" color="primary">
                    {totals.paymentTotal.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" color={totals.balanceTotal < 0 ? 'error' : 'inherit'}>
                    {totals.balanceTotal}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2">
                    {totals.nextMonthPlanningTotal}
                  </Typography>
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

export default ManpowerPlanningTab;
