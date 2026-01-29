import React, { useEffect, useMemo } from "react";
import { Controller, useFormContext, useFieldArray, useWatch, Control } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { formatDateForInput, parseDateFromInput } from "../../../../utils/dateUtils";
import textFieldStyle from "../../../../theme/textFieldStyle";
import { useCurrencyInput } from "../../../../hooks/useCurrencyInput";
import { formatToIndianNumber } from "../../../../utils/numberFormatting";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';


interface TableCellFieldProps {
  name: `progressDeliverable.deliverables.${number}.${keyof MonthlyProgressSchemaType['progressDeliverable']['deliverables'][number]}`;
  control: Control<MonthlyProgressSchemaType>;
  type?: 'text' | 'number' | 'date' | 'multiline' | 'currency';
  placeholder?: string;
}

const TableCellField: React.FC<TableCellFieldProps> = ({ name, control, type = 'text', placeholder }) => {
  const { formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();
  const nameParts = name.split('.');
  const index = parseInt(nameParts[2], 10);
  const fieldName = nameParts[3] as keyof MonthlyProgressSchemaType['progressDeliverable']['deliverables'][number];
  const error = errors.progressDeliverable?.deliverables?.[index]?.[fieldName];

  return (
    <TableCell>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          if (type === 'date') {
            return <TextField type="date" size="small" value={formatDateForInput(field.value as Date | null)} onChange={(e) => field.onChange(parseDateFromInput(e.target.value))} error={!!error} helperText={error?.message} sx={textFieldStyle} InputLabelProps={{ shrink: true }} />;
          }
          if (type === 'currency') {
            // Convert null to undefined for useCurrencyInput hook
            const fieldValue = field.value ?? undefined;
            const currencyInput = useCurrencyInput(fieldValue, name);
            
            return <TextField size="small" placeholder={placeholder} value={currencyInput.value} onChange={currencyInput.getChangeHandler((rawValue) => {
              field.onChange(rawValue);
            })} onWheel={(e) => (e.target as HTMLInputElement).blur()} error={!!error} helperText={error?.message} sx={textFieldStyle} />;
          }
          if (type === 'number') {
            return <TextField type="number" size="small" placeholder={placeholder} value={field.value} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} onWheel={(e) => (e.target as HTMLInputElement).blur()} error={!!error} helperText={error?.message} sx={textFieldStyle} />;
          }
          return <TextField {...field} size="small" placeholder={placeholder} multiline={type === 'multiline'} error={!!error} helperText={error?.message} sx={textFieldStyle} />;
        }}
      />
    </TableCell>
  );
};

const DeliverableTableHeader: React.FC = () => (
  <TableHead>
    <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 600, backgroundColor: '#f5f5f5', border: 'none' } }}>
      <TableCell sx={{ minWidth: 150 }}>Milestone</TableCell>
      <TableCell>Due Date (Contract)</TableCell>
      <TableCell>Due Date (Planned)</TableCell>
      <TableCell>Achieved Date</TableCell>
      <TableCell sx={{ minWidth: 120 }}>Payment Due</TableCell>
      <TableCell>Invoice Date</TableCell>
      <TableCell>Payment Received Date</TableCell>
      <TableCell sx={{ minWidth: 150 }}>Comments</TableCell>
      <TableCell>Actions</TableCell>
    </TableRow>
  </TableHead>
);

interface DeliverableRowProps {
  index: number;
  remove: (index: number) => void;
  control: Control<MonthlyProgressSchemaType>;
}

const DeliverableRow: React.FC<DeliverableRowProps> = ({ index, remove, control }) => (
  <TableRow sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
    <TableCellField name={`progressDeliverable.deliverables.${index}.milestone`} control={control} placeholder="Enter milestone" />
    <TableCellField name={`progressDeliverable.deliverables.${index}.dueDateContract`} control={control} type="date" />
    <TableCellField name={`progressDeliverable.deliverables.${index}.dueDatePlanned`} control={control} type="date" />
    <TableCellField name={`progressDeliverable.deliverables.${index}.achievedDate`} control={control} type="date" />
    <TableCellField name={`progressDeliverable.deliverables.${index}.paymentDue`} control={control} type="currency" placeholder="Amount" />
    <TableCellField name={`progressDeliverable.deliverables.${index}.invoiceDate`} control={control} type="date" />
    <TableCellField name={`progressDeliverable.deliverables.${index}.paymentReceivedDate`} control={control} type="date" />
    <TableCellField name={`progressDeliverable.deliverables.${index}.deliverableComments`} control={control} type="multiline" placeholder="Comments" />
    <TableCell>
      <IconButton onClick={() => remove(index)} size="small" color="error" sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)' } }}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </TableCell>
  </TableRow>
);

const DeliverableTableFooter: React.FC<{ totalPaymentDue: number }> = ({ totalPaymentDue }) => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, borderTop: '1px solid #e0e0e0' }}>
    <Typography variant="h6" sx={{ color: 'green', fontWeight: "bold" }}>Total: {formatToIndianNumber(totalPaymentDue)}</Typography>
  </Box>
);

const ProgressReviewDeliverables: React.FC = () => {
  const { control, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "progressDeliverable.deliverables"
  });

  const deliverables = useWatch({ control, name: "progressDeliverable.deliverables" });
  const totalPaymentDue = useMemo(() => deliverables?.reduce((acc, curr) => acc + (curr.paymentDue || 0), 0) ?? 0, [deliverables]);

  useEffect(() => {
    if (watch('progressDeliverable.totalPaymentDue') !== totalPaymentDue) {
      setValue("progressDeliverable.totalPaymentDue", totalPaymentDue, { shouldDirty: true });
    }
  }, [totalPaymentDue, setValue, watch]);

  const addDeliverableRow = () => {
    append({
      milestone: "",
      dueDateContract: null,
      dueDatePlanned: null,
      achievedDate: null,
      paymentDue: 0,
      invoiceDate: null,
      paymentReceivedDate: null,
      deliverableComments: ""
    });
  };

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ color: '#1976d2' }}>
            Progress Review Deliverables
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addDeliverableRow} size="small" sx={{ borderColor: '#1869DA', color: '#1869DA', '&:hover': { borderColor: '#1565c0', backgroundColor: 'rgba(24, 105, 218, 0.04)' } }}>
            Add Deliverable
          </Button>
        </Box>
        <TableContainer sx={{ maxHeight: 440, overflow: 'auto' }}>
          <Table stickyHeader sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
            <DeliverableTableHeader />
            <TableBody>
              {fields.map((field, index) => (
                <DeliverableRow key={field.id} index={index} remove={remove} control={control} />
              ))}
              {fields.length === 0 && (
                <TableRow sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No deliverables added yet. Click "Add Deliverable" to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <DeliverableTableFooter totalPaymentDue={totalPaymentDue} />
      </Paper>
    </Box>
  );
};

export default ProgressReviewDeliverables;
