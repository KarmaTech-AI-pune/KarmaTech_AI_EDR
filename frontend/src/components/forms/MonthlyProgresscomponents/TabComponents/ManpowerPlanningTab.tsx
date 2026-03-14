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
            value={field.value ?? 0}
            onChange={(e) => {
              const value = e.target.value;
              if (type === 'number') {
                if (value === '' || value === null || value === undefined) {
                  field.onChange(0);
                } else {
                  field.onChange(Number(value));
                }
              } else {
                field.onChange(value);
              }
            }}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            error={!!error}
            helperText={error && typeof error === 'object' && 'message' in error ? error.message : ''}
            sx={{
              ...textFieldStyle,
              width: '100%',
              '& .MuiOutlinedInput-root': {
                padding: '4px 8px',
                height: '36px',
                fontSize: '0.875rem',
              },
              '& .MuiOutlinedInput-input': {
                padding: '8px 4px',
                textAlign: align === 'center' ? 'center' : 'left',
              },
              ...(isReadOnly && {
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f9f9f9',
                  cursor: 'default',
                },
              }),
            }}
            slotProps={{
              input: {
                readOnly: isReadOnly,
              },
              htmlInput: {
                min: 0,
                step: "any"
              }
            }}
          />
        )}
      />
    </TableCell>
  );
};

// Column Configuration
const tableColumns = [
  { name: "workAssignment", label: "Work Assignment", placeholder: "Work Assignment", isReadOnly: true, minWidth: 180 },
  { name: "assignee", label: "Assignee", placeholder: "Assignee", isReadOnly: true, minWidth: 150 },
  { name: "rate", label: "Rate", placeholder: "Rate", type: "number", align: "center", isReadOnly: true, minWidth: 100 },
  { name: "planned", label: "Planned", placeholder: "Planned", type: "number", align: "center", isReadOnly: true, minWidth: 110 },
  { name: "consumed", label: "Consumed", placeholder: "Consumed", type: "number", align: "center", minWidth: 110 },
  { name: "approved", label: "Approved", placeholder: "Approved", type: "number", align: "center", minWidth: 110 },
  { name: "balance", label: "Balance", placeholder: "Balance", type: "number", align: "center", isReadOnly: true, minWidth: 110 },
  { name: "payment", label: "Payment", placeholder: "Payment", type: "number", align: "center", isReadOnly: true, minWidth: 120 },
  { name: "extraHours", label: "Extra Hours", placeholder: "Extra Hours", type: "number", align: "center", minWidth: 120 },
  { name: "extraCost", label: "Extra Cost", placeholder: "Extra Cost", type: "number", align: "center", minWidth: 120 },
  { name: "nextMonthPlanning", label: "Next Month Planning", placeholder: "Next Month", type: "number", align: "center", isReadOnly: true, minWidth: 140 },
  { name: "manpowerComments", label: "Comments", placeholder: "Comments", minWidth: 150 },
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
        approvedTotal: 0,
        balanceTotal: 0,
        paymentTotal: 0,
        extraHoursTotal: 0,
        extraCostTotal: 0,
        nextMonthPlanningTotal: 0
      };
    }

    const plannedTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.planned || 0), 0);
    const consumedTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.consumed || 0), 0);
    const approvedTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.approved || 0), 0);
    const paymentTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.payment || 0), 0);
    const extraHoursTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.extraHours || 0), 0);
    const extraCostTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.extraCost || 0), 0);
    const balanceTotal = plannedTotal - approvedTotal;
    const nextMonthPlanningTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.nextMonthPlanning || 0), 0);

    return {
      plannedTotal,
      consumedTotal,
      approvedTotal,
      balanceTotal,
      paymentTotal,
      extraHoursTotal,
      extraCostTotal,
      nextMonthPlanningTotal
    };
  }, [manpowerEntries]);

  useEffect(() => {
    if (!manpowerEntries) return;

    const newTotals = manpowerEntries.reduce(
      (acc, entry) => {
        acc.plannedTotal += entry.planned || 0;
        acc.consumedTotal += entry.consumed || 0;
        acc.approvedTotal += entry.approved || 0;
        acc.paymentTotal += entry.payment || 0;
        acc.extraHoursTotal += entry.extraHours || 0;
        acc.nextMonthPlanningTotal += entry.nextMonthPlanning || 0;
        return acc;
      },
      { plannedTotal: 0, consumedTotal: 0, approvedTotal: 0, paymentTotal: 0, extraHoursTotal: 0, nextMonthPlanningTotal: 0 }
    );

    const balanceTotal = newTotals.plannedTotal - newTotals.approvedTotal;

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
        const approved = entry.approved || 0;
        const rate = entry.rate || 0;
        const consumed = entry.consumed || 0;
        const balance = planned - approved;
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
          <Table sx={{ 
            '& .MuiTableCell-root': { 
              border: 'none',
              padding: '8px 4px',
              verticalAlign: ''
            }
          }}>
            <TableHead>
              <TableRow sx={{ 
                '& .MuiTableCell-head': { 
                  fontWeight: 600, 
                  backgroundColor: '#f5f5f5', 
                  border: 'none',
                  padding: '12px 4px'
                } 
              }}>
                {tableColumns.map(col => (
                  <TableCell key={col.name} align={(col.align || 'left') as any} sx={{ minWidth: col.minWidth }}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id} sx={{ 
                  '& .MuiTableCell-root': { 
                    border: 'none',
                    padding: '8px 4px'
                  },
                  '&:hover': {
                    backgroundColor: '#fafafa'
                  }
                }}>
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
                  border: 'none',
                  padding: '12px 4px'
                }
              }}>
                <TableCell sx={{ minWidth: 180 }}>
                  <Typography variant="subtitle2">TOTAL</Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}></TableCell>
                <TableCell sx={{ minWidth: 100 }}></TableCell>
                <TableCell align="center" sx={{ minWidth: 110 }}>
                  <Typography variant="subtitle2">
                    {totals.plannedTotal}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ minWidth: 110 }}>
                  <Typography variant="subtitle2">
                    {totals.consumedTotal}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ minWidth: 110 }}>
                  <Typography variant="subtitle2">
                    {totals.approvedTotal}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ minWidth: 110 }}>
                  <Typography variant="subtitle2" color={totals.balanceTotal < 0 ? 'error' : 'inherit'}>
                    {totals.balanceTotal}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ minWidth: 120 }}>
                  <Typography variant="subtitle2" color="primary">
                    {totals.paymentTotal.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ minWidth: 120 }}>
                  <Typography variant="subtitle2">
                    {totals.extraHoursTotal}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ minWidth: 120 }}>
                  <Typography variant="subtitle2">
                    {totals.extraCostTotal.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ minWidth: 140 }}>
                  <Typography variant="subtitle2">
                    {totals.nextMonthPlanningTotal}
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ManpowerPlanningTab;
