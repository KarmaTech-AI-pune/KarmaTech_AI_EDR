import { Controller, useFormContext } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Grid, Paper, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";
import textFieldStyle from "../../../../theme/textFieldStyle";
import { calculateGrossPercentage } from "../../../../utils/calculations";

const CostToCompleteAndEAC: React.FC = () => {
  const { control, formState: { errors }, watch, setValue, getValues } = useFormContext<MonthlyProgressSchemaType>();

  // Watch budget values from financialDetails
  const net = watch('financialDetails.net') || 0;
  const budgetOdcs = watch('financialDetails.budgetOdcs');
  const budgetStaff = watch('financialDetails.budgetStaff');
  
  // Watch actual values from contractAndCost
  const actualOdcs = watch('contractAndCost.actualOdcs');
  const actualStaff = watch('contractAndCost.actualStaff');
  const actualSubtotal = watch('contractAndCost.actualSubtotal') || 0;
  

  // Watch CTC values
  const ctcODC = watch('ctcAndEac.ctcODC');
  const ctcStaff = watch('ctcAndEac.ctcStaff');
  
  // Calculate subtotal based on current CTC values
  const calculatedSubtotal = (ctcODC || 0) + (ctcStaff || 0);
  const totalEAC = actualSubtotal + calculatedSubtotal;
  const grossProfitPercentage = calculateGrossPercentage(net, totalEAC);

  useEffect(() => {
    setValue('ctcAndEac.grossProfitPercentage', grossProfitPercentage);
  }, [grossProfitPercentage, setValue, net, totalEAC]);

  // Track if values have been manually overridden
  const [odcOverridden, setOdcOverridden] = React.useState<boolean>(false);
  const [staffOverridden, setStaffOverridden] = React.useState<boolean>(false);

  // Calculate CTC values when budget or actual values change
  useEffect(() => {
    // Only calculate if both budget and actual values are available
    if (budgetOdcs != null && !odcOverridden) {
      const actualOdcsValue = actualOdcs ?? 0;
      const calculatedCtcODC = budgetOdcs - actualOdcsValue;
      setValue('ctcAndEac.ctcODC', calculatedCtcODC);
    }
  }, [budgetOdcs, actualOdcs, setValue, odcOverridden]);

  useEffect(() => {
    // Only calculate if both budget and actual values are available
    if (budgetStaff != null && !staffOverridden) {
      const actualStaffValue = actualStaff ?? 0;
      const calculatedCtcStaff = budgetStaff - actualStaffValue;
      setValue('ctcAndEac.ctcStaff', calculatedCtcStaff);
    }
  }, [budgetStaff, actualStaff, setValue, staffOverridden]);

  // Update subtotal and totalEAC when CTC values change
  useEffect(() => {
    setValue('ctcAndEac.ctcSubtotal', calculatedSubtotal);
    setValue('ctcAndEac.totalEAC', totalEAC);
  }, [calculatedSubtotal, totalEAC, setValue]);

  // Reset override flags when form is reset or new data is loaded
  useEffect(() => {
    const currentCtcODC = getValues('ctcAndEac.ctcODC');
    const currentCtcStaff = getValues('ctcAndEac.ctcStaff');

    setValue('ctcAndEac.grossProfitPercentage', grossProfitPercentage);
    
    // If values are null or undefined, reset override flags
    if (currentCtcODC == null) {
      setOdcOverridden(false);
    }
    
    if (currentCtcStaff == null) {
      setStaffOverridden(false);
    }
  }, [getValues]);

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
                                  value={field.value ?? ''}
                                  onChange={(e) => {
                                      const value = e.target.value ? Number(e.target.value) : null;
                                      field.onChange(value);
                                      setOdcOverridden(true);
                                  }}
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
                                  value={field.value ?? ''}
                                  onChange={(e) => {
                                      const value = e.target.value ? Number(e.target.value) : null;
                                      field.onChange(value);
                                      setStaffOverridden(true);
                                  }}
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
                      render={() => (
                          <TextField
                              fullWidth
                              label="Total EAC"
                              type="number"
                              value={totalEAC}
                              InputProps={{
                                  readOnly: true,
                              }}
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
                      render={() => (
                          <TextField
                              fullWidth
                              label="Gross Profit %"
                              type="number"
                              value={grossProfitPercentage}
                              InputProps={{
                                  readOnly: true,
                              }}
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
