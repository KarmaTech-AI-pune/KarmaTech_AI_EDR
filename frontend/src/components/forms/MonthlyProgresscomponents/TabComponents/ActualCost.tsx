import React, { useEffect } from "react";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Controller, useFormContext } from "react-hook-form";
import {
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import textFieldStyle from "../../../../theme/textFieldStyle";

const ActualCost: React.FC = () => {
  const { control, formState: { errors }, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

  // Watch actual costs to calculate subtotal
  const actualOdcs = watch('actualCost.actualOdc') || 0;
  const actualStaff = watch('actualCost.actualStaff') || 0;
  const priorCumulativeOdc = watch('actualCost.priorCumulativeOdc') || 0;
  const priorCumulativeStaff = watch('actualCost.priorCumulativeStaff') || 0;

  const calculatedSubtotal = actualOdcs + actualStaff;
  const priorCumulativeTotal = priorCumulativeOdc + priorCumulativeStaff;
  const totalCumulativeOdc = priorCumulativeOdc + actualOdcs;
  const totalCumulativeStaff = priorCumulativeStaff + actualStaff;
  const totalCumulativeCost = totalCumulativeOdc + totalCumulativeStaff;
  
  // Update the actualSubtotal field whenever the calculated value changes
  useEffect(() => {
    setValue('actualCost.actualSubtotal', calculatedSubtotal);
  }, [calculatedSubtotal, setValue]);

  useEffect(() => {
    setValue('actualCost.priorCumulativeTotal', priorCumulativeTotal);
  }, [priorCumulativeTotal, setValue]);

  useEffect(() => {
    setValue('actualCost.totalCumulativeOdc', totalCumulativeOdc);
  }, [totalCumulativeOdc, setValue]);

  useEffect(() => {
    setValue('actualCost.totalCumulativeStaff', totalCumulativeStaff);
  }, [totalCumulativeStaff, setValue]);

  useEffect(() => {
    setValue('actualCost.totalCumulativeCost', totalCumulativeCost);
  }, [totalCumulativeCost, setValue]);

 
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Prior Cumulative
          </Typography>

          <Controller
            name="actualCost.priorCumulativeOdc"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="ODCs"
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  error={!!errors.actualCost?.priorCumulativeOdc}
                  helperText={errors.actualCost?.priorCumulativeOdc?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                />
            )}
          />

          <Controller
            name="actualCost.priorCumulativeStaff"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Staff"
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  error={!!errors.actualCost?.priorCumulativeStaff}
                  helperText={errors.actualCost?.priorCumulativeStaff?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                />
            )}
          />

          <Controller
            name="actualCost.priorCumulativeTotal"
            control={control}
            render={() => (
                <TextField
                  fullWidth
                  label="Subtotal"
                  type="number"
                  value={priorCumulativeTotal}
                  slotProps={{
                    input: {
                      readOnly: true,
                    }
                  }}
                  sx={{
                    ...textFieldStyle,
                    '& .MuiOutlinedInput-root': {
                      ...(textFieldStyle?.['& .MuiOutlinedInput-root'] ? textFieldStyle['& .MuiOutlinedInput-root'] : {}),
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                  margin="normal"
                />
            )}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Actual Costs
          </Typography>

          <Controller
            name="actualCost.actualOdc"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="ODCs"
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  error={!!errors.actualCost?.actualOdc}
                  helperText={errors.actualCost?.actualOdc?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                />
            )}
          />

          <Controller
            name="actualCost.actualStaff"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Staff"
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  error={!!errors.actualCost?.actualStaff}
                  helperText={errors.actualCost?.actualStaff?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                />
            )}
          />

          <Controller
            name="actualCost.actualSubtotal"
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
                      ...(textFieldStyle?.['& .MuiOutlinedInput-root'] ? textFieldStyle['& .MuiOutlinedInput-root'] : {}),
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                  margin="normal"
                />
            )}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Total Cumulative
          </Typography>

          <Controller
            name="actualCost.totalCumulativeOdc"
            control={control}
            render={() => (
                <TextField
                  fullWidth
                  label="ODCs"
                  type="number"
                  value={totalCumulativeOdc}
                  slotProps={{
                    input: {
                      readOnly: true,
                    }
                  }}
                  sx={{
                    ...textFieldStyle,
                    '& .MuiOutlinedInput-root': {
                      ...(textFieldStyle?.['& .MuiOutlinedInput-root'] ? textFieldStyle['& .MuiOutlinedInput-root'] : {}),
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                  margin="normal"
                />
            )}
          />

          <Controller
            name="actualCost.totalCumulativeStaff"
            control={control}
            render={() => (
                <TextField
                  fullWidth
                  label="Staff"
                  type="number"
                  value={totalCumulativeStaff}
                  slotProps={{
                    input: {
                      readOnly: true,
                    }
                  }}
                  sx={{
                    ...textFieldStyle,
                    '& .MuiOutlinedInput-root': {
                      ...(textFieldStyle?.['& .MuiOutlinedInput-root'] ? textFieldStyle['& .MuiOutlinedInput-root'] : {}),
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                  margin="normal"
                />
            )}
          />

          <Controller
            name="actualCost.totalCumulativeCost"
            control={control}
            render={() => (
                <TextField
                  fullWidth
                  label="Subtotal"
                  type="number"
                  value={totalCumulativeCost}
                  slotProps={{
                    input: {
                      readOnly: true,
                    }
                  }}
                  sx={{
                    ...textFieldStyle,
                    '& .MuiOutlinedInput-root': {
                      ...(textFieldStyle?.['& .MuiOutlinedInput-root'] ? textFieldStyle['& .MuiOutlinedInput-root'] : {}),
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

export default ActualCost;
