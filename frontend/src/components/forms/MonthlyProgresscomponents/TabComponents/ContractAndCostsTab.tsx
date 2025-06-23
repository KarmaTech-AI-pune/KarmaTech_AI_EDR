import React, { useEffect } from "react";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Controller, useFormContext } from "react-hook-form";
import {
  Grid,
  Paper,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import textFieldStyle from "../../../../theme/textFieldStyle";

const ContractAndCostsTab: React.FC = () => {
  const { control, formState: { errors }, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

  // Watch actual costs to calculate subtotal
  const actualOdcs = watch('contractAndCost.actualOdcs') || 0;
  const actualStaff = watch('contractAndCost.actualStaff') || 0;
  const calculatedSubtotal = actualOdcs + actualStaff;
  
  // Watch contract type
  const contractType = watch('contractAndCost.contractType');

  // Update the actualSubtotal field whenever the calculated value changes
  useEffect(() => {
    setValue('contractAndCost.actualSubtotal', calculatedSubtotal);
  }, [calculatedSubtotal, setValue]);

 
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Contract Type
          </Typography>

<FormControlLabel
  control={
    <Checkbox
      checked={contractType === 'lumpsum'}
      onChange={() => {
        setValue('contractAndCost.contractType', 'lumpsum');
      }}
      sx={{
        '&.Mui-checked': {
          color: '#1869DA'
        }
      }}
    />
  }
  label="Lumpsum"
/>

<FormControlLabel
  control={
    <Checkbox
      checked={contractType === 'timeAndExpense'}
      onChange={() => {
        setValue('contractAndCost.contractType', 'timeAndExpense');
      }}
      sx={{
        '&.Mui-checked': {
          color: '#1869DA'
        }
      }}
    />
  }
  label="Time & Expense"
/>

          <Controller
            name="contractAndCost.percentage"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Percentage"
                  type="number"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  error={!!errors.contractAndCost?.percentage}
                  helperText={errors.contractAndCost?.percentage?.message || ''}
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
            name="contractAndCost.actualOdcs"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="ODCs"
                  type="number"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  error={!!errors.contractAndCost?.actualOdcs}
                  helperText={errors.contractAndCost?.actualOdcs?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                />
            )}
          />

          <Controller
            name="contractAndCost.actualStaff"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Staff"
                  type="number"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  error={!!errors.contractAndCost?.actualStaff}
                  helperText={errors.contractAndCost?.actualStaff?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                />
            )}
          />

          <Controller
            name="contractAndCost.actualSubtotal"
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
