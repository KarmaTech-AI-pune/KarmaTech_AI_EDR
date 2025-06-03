import React from "react";
import { MonthlyProgressSchemaType } from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Controller, useFormContext } from "react-hook-form";
import {
  Grid,
  Paper,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const ContractAndCostsTab: React.FC = () => {
  const { control, formState: { errors }, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

  // Watch actual costs to calculate subtotal
  const actualOdcs = watch('actualOdcs') || 0;
  const actualStaff = watch('actualStaff') || 0;
  const calculatedSubtotal = actualOdcs + actualStaff;

  // Update the actualSubtotal field whenever the calculated value changes
  React.useEffect(() => {
    setValue('actualSubtotal', calculatedSubtotal);
  }, [calculatedSubtotal, setValue]);

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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Contract Type
          </Typography>

          <Controller
            name="lumpsum"
            control={control}
            render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      sx={{
                        '&.Mui-checked': {
                          color: '#1869DA'
                        }
                      }}
                    />
                  }
                  label="Lumpsum"
                />
            )}
          />

          <Controller
            name="timeAndExpense"
            control={control}
            render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      sx={{
                        '&.Mui-checked': {
                          color: '#1869DA'
                        }
                      }}
                    />
                  }
                  label="Time & Expense"
                />
            )}
          />

          <Controller
            name="percentage"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Percentage"
                  type="number"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  error={!!errors.percentage}
                  helperText={errors.percentage?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                />
            )}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Actual Costs
          </Typography>

          <Controller
            name="actualOdcs"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="ODCs"
                  type="number"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  error={!!errors.actualOdcs}
                  helperText={errors.actualOdcs?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                />
            )}
          />

          <Controller
            name="actualStaff"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Staff"
                  type="number"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  error={!!errors.actualStaff}
                  helperText={errors.actualStaff?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                />
            )}
          />

          <Controller
            name="actualSubtotal"
            control={control}
            render={() => (
                <TextField
                  fullWidth
                  label="Subtotal"
                  type="number"
                  value={calculatedSubtotal}
                  slotProps={{
                    input: {
                      readOnly: true,
                    }
                  }}
                  sx={{
                    ...textFieldStyle,
                    '& .MuiOutlinedInput-root': {
                      ...textFieldStyle['& .MuiOutlinedInput-root'],
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                  margin="normal"
                />
            )}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ContractAndCostsTab;
