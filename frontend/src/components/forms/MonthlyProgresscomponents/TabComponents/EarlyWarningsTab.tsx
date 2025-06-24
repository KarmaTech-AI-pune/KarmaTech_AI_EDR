
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Controller, useFormContext, useFieldArray } from 'react-hook-form';
import { MonthlyProgressSchemaType } from '../../../../schemas/monthlyProgress/MonthlyProgressSchema';

const EarlyWarningsTab: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "earlyWarnings"
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

  // Add new early warning row
  const addEarlyWarningRow = () => {
    const newIndex = fields.length;
    append({
      WarningsDescription: ""
    });
    setEditingIndex(newIndex); // Immediately set the new row to edit mode
  };

  // Remove early warning row
  const removeEarlyWarningRow = (index: number) => {
    remove(index);
  };

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Early Warnings
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addEarlyWarningRow}
            sx={{
              borderColor: '#1869DA',
              color: '#1869DA',
              '&:hover': {
                borderColor: '#1869DA',
                backgroundColor: 'rgba(24, 105, 218, 0.04)'
              }
            }}
          >
            Add issue
          </Button>
        </Box>

        <TableContainer>
          <Table sx={{ '& .MuiTableCell-root': { border: 'none' } }}>           
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id} sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
                  <TableCell sx={{ width: '100%' }}> 
                    {editingIndex === index ? (
                      <Controller
                        name={`earlyWarnings.${index}.WarningsDescription`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Enter warning description..."
                            value={field.value || ''}
                            error={!!errors.earlyWarnings?.[index]?.WarningsDescription}
                            helperText={errors.earlyWarnings?.[index]?.WarningsDescription?.message}
                            sx={textFieldStyle}
                            onBlur={() => {
                              update(index, { WarningsDescription: field.value }); // Update the field array with the current value
                              setEditingIndex(null); // Exit edit mode on blur
                            }}
                            autoFocus // Focus on new text field
                          />
                        )}
                      />
                    ) : (
                      <Paper elevation={1} sx={{ p: 2, width: '95%', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            flexGrow: 1,
                          }}
                        >
                          {field.WarningsDescription || 'No description entered.'}
                        </Typography>
                        <Box sx={{ display: 'flex',flexDirection: 'column' , gap: 1, flexShrink: 0, ml:2 }}> 
                          <IconButton
                            onClick={() => setEditingIndex(index)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => removeEarlyWarningRow(index)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {fields.length === 0 && (
                <TableRow sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
                  <TableCell colSpan={2} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No early warnings. Click "Add Row" to get started.
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

export default EarlyWarningsTab;
