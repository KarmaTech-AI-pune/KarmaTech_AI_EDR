import { Controller, useFormContext } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Grid, Paper, TextField, Typography } from "@mui/material";
import React from "react";


const CostToCompleteAndEAC: React.FC = () => {
  const { control, formState: { errors }, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

  const ctcODC = watch('ctcAndEac.ctcODC') || 0;
  const ctcStaff = watch('ctcAndEac.ctcStaff') || 0;
  const calculatedSubtotal = ctcODC + ctcStaff;

  React.useEffect(() => {
    setValue('ctcAndEac.ctcSubtotal', calculatedSubtotal);
  }, [calculatedSubtotal, setValue]);

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

  return (
      <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                      Costs to Complete
                  </Typography>

                  <Controller
                      name="ctcAndEac.ctcODC"
                      control={control}
                      render={({ field }) => (
                          <TextField
                              fullWidth
                              label="ODCs"
                              type="number"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              onWheel={(e) => (e.target as HTMLInputElement).blur()}
                              error={!!errors.ctcAndEac?.ctcODC}
                              helperText={errors.ctcAndEac?.ctcODC?.message || ''}
                              sx={textFieldStyle}
                              margin="normal"
                          />
                      )}
                  />

                  <Controller
                      name="ctcAndEac.ctcStaff"
                      control={control}
                      render={({ field }) => (
                          <TextField
                              fullWidth
                              label="Staff"
                              type="number"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              onWheel={(e) => (e.target as HTMLInputElement).blur()}
                              error={!!errors.ctcAndEac?.ctcStaff}
                              helperText={errors.ctcAndEac?.ctcStaff?.message || ''}
                              sx={textFieldStyle}
                              margin="normal"
                          />
                      )}
                  />
                  <Controller
                      name="ctcAndEac.ctcSubtotal"
                      control={control}
                      render={({ field }) => (
                          <TextField
                              fullWidth
                              label="Subtotal"
                              type="number"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              onWheel={(e) => (e.target as HTMLInputElement).blur()}
                              error={!!errors.ctcAndEac?.ctcSubtotal}
                              helperText={errors.ctcAndEac?.ctcSubtotal?.message || ''}
                              inputProps={{
                                  readOnly: true,
                              }}
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
                      EAC Estimate
                  </Typography>

                  <Controller
                      name="ctcAndEac.totalEAC"
                      control={control}
                      render={({ field }) => (
                          <TextField
                              fullWidth
                              label="Total EAC"
                              type="number"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              onWheel={(e) => (e.target as HTMLInputElement).blur()}
                              error={!!errors.ctcAndEac?.totalEAC}
                              helperText={errors.ctcAndEac?.totalEAC?.message || ''}
                              sx={textFieldStyle}
                              margin="normal"
                          />
                      )}
                  />

                  <Controller
                      name="ctcAndEac.grossProfitPercentage"
                      control={control}
                      render={({ field }) => (
                          <TextField
                              fullWidth
                              label="Gross Profit %"
                              type="number"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              onWheel={(e) => (e.target as HTMLInputElement).blur()}
                              error={!!errors.ctcAndEac?.grossProfitPercentage}
                              helperText={errors.ctcAndEac?.grossProfitPercentage?.message || ''}
                              sx={textFieldStyle}
                              margin="normal"
                          />
                      )}
                  />
              </Paper>
          </Grid>
      </Grid>
  )
}

export default CostToCompleteAndEAC
