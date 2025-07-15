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

const ProgrammeScheduleTab: React.FC = () => {
  const { watch, control, formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();
  const programmeScheduleData = watch("programmeSchedule");
  
  console.log("ProgrammeScheduleTab received data:", programmeScheduleData);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "programmeSchedule"
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

  // Add new programme schedule row
  const addProgrammeScheduleRow = () => {
    const newIndex = fields.length;
    append({
      programmeDescription: ""
    });
    setEditingIndex(newIndex);
  };

  // Remove programme schedule row
  const removeProgrammeScheduleRow = (index: number) => {
    remove(index);
  };

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Programme Schedule
          </Typography>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addProgrammeScheduleRow}
            sx={{
              borderColor: '#1869DA',
              color: '#1869DA',
              '&:hover': {
                borderColor: '#1869DA',
                backgroundColor: 'rgba(24, 105, 218, 0.04)'
              }
            }}
          >
            Add
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
                        name={`programmeSchedule.${index}.programmeDescription`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Enter programme description..."
                            value={field.value || ''}
                            error={!!errors.programmeSchedule?.[index]?.programmeDescription}
                            helperText={errors.programmeSchedule?.[index]?.programmeDescription?.message}
                            sx={textFieldStyle}
                            onBlur={() => {
                              update(index, { programmeDescription: field.value }); 
                              setEditingIndex(null);
                            }}
                            autoFocus
                          />
                        )}
                      />
                    ) : (
                      <Paper elevation={1} sx={{ p: 2, width: '95%', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {field.programmeDescription || 'No description entered.'} 
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml:2, flexShrink: 0 }}>
                          <IconButton
                            onClick={() => setEditingIndex(index)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => removeProgrammeScheduleRow(index)}
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
                  <TableCell colSpan={1} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No programme schedule entries. Click "Add" to get started.
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

export default ProgrammeScheduleTab;