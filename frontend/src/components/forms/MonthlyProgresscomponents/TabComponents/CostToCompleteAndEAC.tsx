import { Controller, useFormContext } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Grid, Paper, TextField, Typography } from "@mui/material";
import React from "react";


const CostToCompleteAndEAC: React.FC = () => {
  const { control, formState: { errors }, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

  const ctcODC = watch('ctcODC') || 0;
  const ctcStaff = watch('ctcStaff') || 0;
  const calculatedSubtotal = ctcODC + ctcStaff;

  React.useEffect(() => {
    setValue('ctcSubtotal', calculatedSubtotal);
  }, [calculatedSubtotal, setValue]);

  return (
      <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                      Costs to Complete
                  </Typography>

                  <Controller
                      name="ctcODC"
                      control={control}
                      render={({ field }) => (
                          <TextField
                              fullWidth
                              label="ODCs"
                              type="number"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              error={!!errors.ctcODC}
                              helperText={errors.ctcODC?.message || ''}
                              sx={{ mb: 2 }}
                          />
                      )}
                  />

                  <Controller
                      name="ctcStaff"
                      control={control}
                      render={({ field }) => (
                          <TextField
                              fullWidth
                              label="Staff"
                              type="number"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              error={!!errors.ctcStaff}
                              helperText={errors.ctcStaff?.message || ''}
                              sx={{ mb: 2 }}
                          />
                      )}
                  />
                  <Controller
                      name="ctcSubtotal"
                      control={control}
                      render={({ field }) => (
                          <TextField
                              fullWidth
                              label="Subtotal"
                              type="number"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              error={!!errors.ctcSubtotal}
                              helperText={errors.ctcSubtotal?.message || ''}
                              inputProps={{
                                  readOnly: true,
                              }}
                              sx={{ mb: 2 }}
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
                      name="totalEAC"
                      control={control}
                      render={({ field }) => (
                          <TextField
                              fullWidth
                              label="Total EAC"
                              type="number"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              error={!!errors.totalEAC}
                              helperText={errors.totalEAC?.message || ''}
                              sx={{ mb: 2 }}
                          />
                      )}
                  />

                  <Controller
                      name="grossProfitPercentage"
                      control={control}
                      render={({ field }) => (
                          <TextField
                              fullWidth
                              label="Gross Profit %"
                              type="number"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              error={!!errors.grossProfitPercentage}
                              helperText={errors.grossProfitPercentage?.message || ''}
                              sx={{ mb: 2 }}
                          />
                      )}
                  />
              </Paper>
          </Grid>
      </Grid>
  )
}

export default CostToCompleteAndEAC
