import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Controller, useFormContext, useFieldArray } from 'react-hook-form';
import { MonthlyProgressSchemaType } from '../../../../schemas/monthlyProgress/MonthlyProgressSchema';
import { formatDateForInput, parseDateFromInput } from '../../../../utils/dateUtils';

const CurrentMonthActionsTab: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "currentMonthActions"
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
    }
  };


  // Add new current month action row
  const addCurrentMonthActionRow = () => {
    append({
      actions: "",
      date: new Date().toISOString(),
      comments: "",
      priority: null
    });
  };

  // Remove current month action row
  const removeCurrentMonthActionRow = (index: number) => {
    remove(index);
  };

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Current Month Actions
        </Typography>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addCurrentMonthActionRow}
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
                <TableCell>Actions</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id} sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
                  <TableCell>
                    <Controller
                      name={`currentMonthActions.${index}.actions`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          placeholder="Action Description"
                          value={field.value || ''}
                          error={!!errors.currentMonthActions?.[index]?.actions}
                          helperText={errors.currentMonthActions?.[index]?.actions?.message}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`currentMonthActions.${index}.date`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="date"
                          value={formatDateForInput(field.value)}
                          onChange={(e) => field.onChange(parseDateFromInput(e.target.value))}
                          error={!!errors.currentMonthActions?.[index]?.date}
                          helperText={errors.currentMonthActions?.[index]?.date?.message}
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
                      name={`currentMonthActions.${index}.comments`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          placeholder="Comments"
                          value={field.value || ''}
                          error={!!errors.currentMonthActions?.[index]?.comments}
                          helperText={errors.currentMonthActions?.[index]?.comments?.message}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`currentMonthActions.${index}.priority`}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small" error={!!errors.currentMonthActions?.[index]?.priority}>
                          <Select
                            {...field}
                            value={field.value || ''}
                            displayEmpty
                            sx={textFieldStyle}
                          >
                            <MenuItem value="">
                              <em>Select Priority</em>
                            </MenuItem>
                            <MenuItem value="H">High</MenuItem>
                            <MenuItem value="M">Medium</MenuItem>
                            <MenuItem value="L">Low</MenuItem>
                          </Select>
                          {errors.currentMonthActions?.[index]?.priority && (
                            <FormHelperText>{errors.currentMonthActions?.[index]?.priority?.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => removeCurrentMonthActionRow(index)}
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
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No current month actions. Click "Add Row" to get started.
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

export default CurrentMonthActionsTab;
