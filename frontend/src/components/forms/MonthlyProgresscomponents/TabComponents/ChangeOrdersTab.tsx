import React from "react";
import { Controller, useFormContext, useFieldArray } from "react-hook-form";
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

const ChangeOrdersTab: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "changeOrder"
  });

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

  // Add new change order row
  const addChangeOrderRow = () => {
    append({
      contractTotal: null,
      cost: null,
      fee: null,
      summaryDetails: "",
      status: "Proposed"
    });
  };

  // Remove change order row
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
                    <Controller
                      name={`changeOrder.${index}.contractTotal`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="Contract Total"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          error={!!errors.changeOrder?.[index]?.contractTotal}
                          helperText={errors.changeOrder?.[index]?.contractTotal?.message}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`changeOrder.${index}.cost`}
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
                          error={!!errors.changeOrder?.[index]?.cost}
                          helperText={errors.changeOrder?.[index]?.cost?.message}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`changeOrder.${index}.fee`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="Fee"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          error={!!errors.changeOrder?.[index]?.fee}
                          helperText={errors.changeOrder?.[index]?.fee?.message}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`changeOrder.${index}.summaryDetails`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          placeholder="Summary Details"
                          value={field.value || ''}
                          error={!!errors.changeOrder?.[index]?.summaryDetails}
                          helperText={errors.changeOrder?.[index]?.summaryDetails?.message}
                          sx={textFieldStyle}
                        />
                      )}
                    />
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
