import React, { useEffect } from "react";
import { Controller, useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import textFieldStyle from "../../../../theme/textFieldStyle";
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
  TableFooter,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const ProgressReviewDeliverables: React.FC = () => {
  const { control, formState: { errors }, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "progressDeliverable.deliverables"
  });

  const deliverables = useWatch({
    control,
    name: "progressDeliverable.deliverables",
  });

  const totalPaymentDue = deliverables?.reduce((acc, curr) => acc + (curr.paymentDue || 0), 0) ?? 0;

  useEffect(() => {
    if (watch('progressDeliverable.totalPaymentDue') !== totalPaymentDue) {
      setValue("progressDeliverable.totalPaymentDue", totalPaymentDue, { shouldDirty: true });
    }
  }, [totalPaymentDue, setValue, watch]);


  // Add new progress deliverable row
  const addDeliverableRow = () => {
    append({
      milestone: "",
      dueDateContract: new Date(),
      dueDatePlanned: new Date(),
      achievedDate: new Date(),
      paymentDue: 0,
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
                  <TableRow key={field.id} sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
                    <TableCell>
                      <Controller
                        name={`progressDeliverable.deliverables.${index}.milestone`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            {...controllerField}
                            size="small"
                            placeholder="Enter milestone"
                            error={!!errors.progressDeliverable?.deliverables?.[index]?.milestone}
                            helperText={errors.progressDeliverable?.deliverables?.[index]?.milestone?.message}
                            sx={textFieldStyle}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`progressDeliverable.deliverables.${index}.dueDateContract`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            type="date"
                            size="small"
                            value={formatDateForInput(controllerField.value)}
                            onChange={(e) => controllerField.onChange(parseDateFromInput(e.target.value))}
                            error={!!errors.progressDeliverable?.deliverables?.[index]?.dueDateContract}
                            helperText={errors.progressDeliverable?.deliverables?.[index]?.dueDateContract?.message}
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
                        name={`progressDeliverable.deliverables.${index}.dueDatePlanned`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            type="date"
                            size="small"
                            value={formatDateForInput(controllerField.value)}
                            onChange={(e) => controllerField.onChange(parseDateFromInput(e.target.value))}
                            error={!!errors.progressDeliverable?.deliverables?.[index]?.dueDatePlanned}
                            helperText={errors.progressDeliverable?.deliverables?.[index]?.dueDatePlanned?.message}
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
                        name={`progressDeliverable.deliverables.${index}.achievedDate`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            type="date"
                            size="small"
                            value={formatDateForInput(controllerField.value)}
                            onChange={(e) => controllerField.onChange(parseDateFromInput(e.target.value))}
                            error={!!errors.progressDeliverable?.deliverables?.[index]?.achievedDate}
                            helperText={errors.progressDeliverable?.deliverables?.[index]?.achievedDate?.message}
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
                        name={`progressDeliverable.deliverables.${index}.paymentDue`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            type="number"
                            size="small"
                            placeholder="Amount"
                            value={controllerField.value}
                            onChange={(e) => controllerField.onChange(e.target.value ? Number(e.target.value) : null)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            error={!!errors.progressDeliverable?.deliverables?.[index]?.paymentDue}
                            helperText={errors.progressDeliverable?.deliverables?.[index]?.paymentDue?.message}
                            sx={textFieldStyle}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`progressDeliverable.deliverables.${index}.invoiceDate`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            type="date"
                            size="small"
                            value={formatDateForInput(controllerField.value)}
                            onChange={(e) => controllerField.onChange(parseDateFromInput(e.target.value))}
                            error={!!errors.progressDeliverable?.deliverables?.[index]?.invoiceDate}
                            helperText={errors.progressDeliverable?.deliverables?.[index]?.invoiceDate?.message}
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
                        name={`progressDeliverable.deliverables.${index}.paymentReceivedDate`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            type="date"
                            size="small"
                            value={formatDateForInput(controllerField.value)}
                            onChange={(e) => controllerField.onChange(parseDateFromInput(e.target.value))}
                            error={!!errors.progressDeliverable?.deliverables?.[index]?.paymentReceivedDate}
                            helperText={errors.progressDeliverable?.deliverables?.[index]?.paymentReceivedDate?.message}
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
                        name={`progressDeliverable.deliverables.${index}.deliverableComments`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            {...controllerField}
                            size="small"
                            placeholder="Comments"
                            multiline
                            error={!!errors.progressDeliverable?.deliverables?.[index]?.deliverableComments}
                            helperText={errors.progressDeliverable?.deliverables?.[index]?.deliverableComments?.message}
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
          <Table>
            <TableFooter>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ border: 'none', textAlign: 'right', py:1 }}>
                  <Typography variant="h6" sx={{ color: 'green', fontWeight: "bold", px:5 }}>Total: {totalPaymentDue}</Typography>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
      </Paper>
    </Box>
  );
};

export default ProgressReviewDeliverables;
