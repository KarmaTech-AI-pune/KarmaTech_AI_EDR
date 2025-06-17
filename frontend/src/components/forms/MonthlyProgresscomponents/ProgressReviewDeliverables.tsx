import React from "react";
import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
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

const ProgressReviewDeliverables: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "progressDeliverable"
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

  // Add new progress deliverable row
  const addDeliverableRow = () => {
    append({
      milestone: "",
      dueDateContract: new Date(),
      dueDatePlanned: new Date(),
      achievedDate: new Date(),
      paymentDue: null,
      invoiceDate: new Date(),
      paymentReceivedDate: new Date(),
      deliverableComments: ""
    });
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Parse date from input field
  const parseDateFromInput = (dateString: string): Date => {
    return new Date(dateString);
  };


  return (
    <Box>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6" component="h2" sx={{ color: '#1976d2' }}>
            Progress Review Deliverables
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addDeliverableRow}
            size="small"
            sx={{
              borderColor: '#1869DA',
              color: '#1869DA',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: 'rgba(24, 105, 218, 0.04)',
              },
            }}
          >
            Add Deliverable
          </Button>
        </Box>

        
          <TableContainer>
            <Table sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
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
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Controller
                        name={`progressDeliverable.${index}.milestone`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            {...controllerField}
                            size="small"
                            placeholder="Enter milestone"
                            error={!!errors.progressDeliverable?.[index]?.milestone}
                            helperText={errors.progressDeliverable?.[index]?.milestone?.message}
                            sx={textFieldStyle}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`progressDeliverable.${index}.dueDateContract`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            type="date"
                            size="small"
                            value={formatDateForInput(controllerField.value)}
                            onChange={(e) => controllerField.onChange(parseDateFromInput(e.target.value))}
                            error={!!errors.progressDeliverable?.[index]?.dueDateContract}
                            helperText={errors.progressDeliverable?.[index]?.dueDateContract?.message}
                            sx={textFieldStyle}
                            slotProps={{
                              inputLabel: {
                                shrink: true,
                              }
                            }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`progressDeliverable.${index}.dueDatePlanned`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            type="date"
                            size="small"
                            value={formatDateForInput(controllerField.value)}
                            onChange={(e) => controllerField.onChange(parseDateFromInput(e.target.value))}
                            error={!!errors.progressDeliverable?.[index]?.dueDatePlanned}
                            helperText={errors.progressDeliverable?.[index]?.dueDatePlanned?.message}
                            sx={textFieldStyle}
                            slotProps={{
                              inputLabel: {
                                shrink: true,
                              }
                            }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`progressDeliverable.${index}.achievedDate`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            type="date"
                            size="small"
                            value={formatDateForInput(controllerField.value)}
                            onChange={(e) => controllerField.onChange(parseDateFromInput(e.target.value))}
                            error={!!errors.progressDeliverable?.[index]?.achievedDate}
                            helperText={errors.progressDeliverable?.[index]?.achievedDate?.message}
                            sx={textFieldStyle}
                            slotProps={{
                              inputLabel: {
                                shrink: true,
                              }
                            }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`progressDeliverable.${index}.paymentDue`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            type="number"
                            size="small"
                            placeholder="Amount"
                            value={controllerField.value || ''}
                            onChange={(e) => controllerField.onChange(e.target.value ? Number(e.target.value) : null)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            error={!!errors.progressDeliverable?.[index]?.paymentDue}
                            helperText={errors.progressDeliverable?.[index]?.paymentDue?.message}
                            sx={textFieldStyle}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`progressDeliverable.${index}.invoiceDate`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            type="date"
                            size="small"
                            value={formatDateForInput(controllerField.value)}
                            onChange={(e) => controllerField.onChange(parseDateFromInput(e.target.value))}
                            error={!!errors.progressDeliverable?.[index]?.invoiceDate}
                            helperText={errors.progressDeliverable?.[index]?.invoiceDate?.message}
                            sx={textFieldStyle}
                            slotProps={{
                              inputLabel: {
                                shrink: true,
                              }
                            }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`progressDeliverable.${index}.paymentReceivedDate`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            type="date"
                            size="small"
                            value={formatDateForInput(controllerField.value)}
                            onChange={(e) => controllerField.onChange(parseDateFromInput(e.target.value))}
                            error={!!errors.progressDeliverable?.[index]?.paymentReceivedDate}
                            helperText={errors.progressDeliverable?.[index]?.paymentReceivedDate?.message}
                            sx={textFieldStyle}
                            slotProps={{
                              inputLabel: {
                                shrink: true,
                              }
                            }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`progressDeliverable.${index}.deliverableComments`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            {...controllerField}
                            size="small"
                            placeholder="Comments"
                            multiline
                            rows={2}
                            error={!!errors.progressDeliverable?.[index]?.deliverableComments}
                            helperText={errors.progressDeliverable?.[index]?.deliverableComments?.message}
                            sx={textFieldStyle}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => remove(index)}
                        size="small"
                        color="error"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.04)',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
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
      </Paper>
    </Box>
  );
};

export default ProgressReviewDeliverables;
