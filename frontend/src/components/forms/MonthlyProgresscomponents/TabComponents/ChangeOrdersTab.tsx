import React from "react";
import { Controller, useFormContext, useFieldArray, FieldPath } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
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
  Select,
  MenuItem,
  FormControl,
  FormHelperText
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import textFieldStyle from "../../../../theme/textFieldStyle";

interface BudgetTextFieldProps {
  name: FieldPath<MonthlyProgressSchemaType>;
  control: any;
  placeholder: string;
  readOnly?: boolean;
  endAdornment?: string;
  type?: string;
}

const BudgetTextField: React.FC<BudgetTextFieldProps> = ({
  name,
  control,
  placeholder,
  readOnly = false,
  endAdornment,
  type = "text"
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
          type={type}
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

const ChangeOrdersTab: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "changeOrder"
  });

  const addChangeOrderRow = () => {
    append({
      contractTotal: null,
      cost: null,
      fee: null,
      summaryDetails: "",
      status: "Proposed"
    });
  };

  const removeChangeOrderRow = (index: number) => {
    remove(index);
  };

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary">
            Change Orders
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addChangeOrderRow}
            sx={{
              borderColor: '#1869DA',
              color: '#1869DA',
              '&:hover': {
                borderColor: '#1869DA',
                backgroundColor: 'rgba(24, 105, 218, 0.04)'
              }
            }}
          >
            Add Row
          </Button>
        </Box>

        <TableContainer>
          <Table sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 600, backgroundColor: '#f5f5f5', border: 'none' } }}>
                <TableCell>Contract Total</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Fee</TableCell>
                <TableCell>Summary Details</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id} sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
                  <TableCell>
                    <BudgetTextField name={`changeOrder.${index}.contractTotal`} control={control} placeholder="Contract Total" type="number" />
                  </TableCell>
                  <TableCell>
                    <BudgetTextField name={`changeOrder.${index}.cost`} control={control} placeholder="Cost" type="number" />
                  </TableCell>
                  <TableCell>
                    <BudgetTextField name={`changeOrder.${index}.fee`} control={control} placeholder="Fee" type="number" />
                  </TableCell>
                  <TableCell>
                    <BudgetTextField name={`changeOrder.${index}.summaryDetails`} control={control} placeholder="Summary Details" />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`changeOrder.${index}.status`}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small" error={!!errors.changeOrder?.[index]?.status}>
                          <Select
                            {...field}
                            value={field.value || 'Proposed'}
                            sx={textFieldStyle}
                          >
                            <MenuItem value="Proposed">Proposed</MenuItem>
                            <MenuItem value="Submitted">Submitted</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                          </Select>
                          {errors.changeOrder?.[index]?.status && (
                            <FormHelperText>{errors.changeOrder?.[index]?.status?.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => removeChangeOrderRow(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {fields.length === 0 && (
                <TableRow sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No change orders. Click "Add Row" to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ChangeOrdersTab;
