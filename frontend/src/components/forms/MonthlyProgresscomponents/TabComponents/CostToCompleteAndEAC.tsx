import { Controller, useFormContext } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Grid, Paper, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";
import textFieldStyle from "../../../../theme/textFieldStyle";
import { calculateGrossPercentage } from "../../../../utils/calculations";

const CostToCompleteAndEAC: React.FC = () => {
  const { control, formState: { errors }, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

  // Watch budget values from financialDetails
  const net = watch('financialAndContractDetails.net') || 0;
  const budgetOdcs = watch('financialAndContractDetails.budgetOdcs');
  const budgetStaff = watch('financialAndContractDetails.budgetStaff');
  
  // Watch actual values from contractAndCost
  const actualOdcs = watch('actualCost.actualOdc');
  const actualStaff = watch('actualCost.actualStaff');
  const actualSubtotal = watch('actualCost.actualSubtotal') || 0;
  

  // Watch CTC values
  const ctcODC = watch('ctcAndEac.ctcODC');
  const ctcStaff = watch('ctcAndEac.ctcStaff');
  const actualctcODC = watch('ctcAndEac.actualctcODC');
  const actualCtcStaff = watch('ctcAndEac.actualCtcStaff');
  
  // Calculate subtotal based on current CTC values
  const calculatedSubtotal = (ctcODC || 0) + (ctcStaff || 0);
  const actualCtcSubtotal = (actualctcODC || 0) + (actualCtcStaff || 0);
  const totalEAC = actualSubtotal + calculatedSubtotal;
  const grossProfitPercentage = calculateGrossPercentage(net, totalEAC);

  useEffect(() => {
    setValue('ctcAndEac.grossProfitPercentage', grossProfitPercentage);
    setValue('budgetTable.currentBudgetInMIS.profitPercentage',grossProfitPercentage)
    setValue('ctcAndEac.totalEAC', totalEAC)
    setValue('budgetTable.currentBudgetInMIS.cost', totalEAC)
  }, [grossProfitPercentage, setValue, net, totalEAC]);

  // Calculate CTC values when budget or actual values change
  useEffect(() => {
    // Only calculate if both budget and actual values are available
    if (budgetOdcs != null) {
      const actualOdcsValue = actualOdcs ?? 0;
      const calculatedCtcODC = budgetOdcs - actualOdcsValue;
      setValue('ctcAndEac.ctcODC', calculatedCtcODC);
    }
  }, [budgetOdcs, actualOdcs, setValue]);

  useEffect(() => {
    // Only calculate if both budget and actual values are available
    if (budgetStaff != null) {
      const actualStaffValue = actualStaff ?? 0;
      const calculatedCtcStaff = budgetStaff - actualStaffValue;
      setValue('ctcAndEac.ctcStaff', calculatedCtcStaff);
    }
  }, [budgetStaff, actualStaff, setValue]);

  // Update subtotal and totalEAC when CTC values change
  useEffect(() => {
    setValue('ctcAndEac.ctcSubtotal', calculatedSubtotal);
    setValue('ctcAndEac.actualCtcSubtotal', actualCtcSubtotal);
    setValue('ctcAndEac.eacOdc', (actualOdcs || 0) + (ctcODC || 0));
    setValue('ctcAndEac.eacStaff', (actualStaff || 0) + (ctcStaff || 0));
  }, [calculatedSubtotal, totalEAC, setValue, actualCtcSubtotal, actualOdcs, ctcODC, actualStaff, ctcStaff]);

  return (
      <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
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
                                  value={field.value}
                                  onChange={(e) => {
                                      const value = e.target.value ? Number(e.target.value) : null;
                                      field.onChange(value);
                                  }}
                                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                  error={!!errors.ctcAndEac?.ctcODC}
                                  helperText={errors.ctcAndEac?.ctcODC?.message || ''}
                                  sx={textFieldStyle}
                                  margin="normal"
                                  InputProps={{
                                      readOnly: true,
                                  }}
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
                                  value={field.value}
                                  onChange={(e) => {
                                      const value = e.target.value ? Number(e.target.value) : null;
                                      field.onChange(value);
                                  }}
                                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                  error={!!errors.ctcAndEac?.ctcStaff}
                                  helperText={errors.ctcAndEac?.ctcStaff?.message || ''}
                                  sx={textFieldStyle}
                                  margin="normal"
                                  InputProps={{
                                      readOnly: true,
                                  }}
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
                              value={field.value}
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
          <Grid item xs={12} md={3}>
              <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                      Actual Cost To Complete
                  </Typography>

                  <Controller
                      name="ctcAndEac.actualctcODC"
                      control={control}
                      render={({ field }) => (
                              <TextField
                                  fullWidth
                                  label="ODCs"
                                  type="number"
                                  value={field.value}
                                  onChange={(e) => {
                                      const value = e.target.value ? Number(e.target.value) : null;
                                      field.onChange(value);
                                  }}
                                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                  error={!!errors.ctcAndEac?.actualctcODC}
                                  helperText={errors.ctcAndEac?.actualctcODC?.message || ''}
                                  sx={textFieldStyle}
                                  margin="normal"
                              />
                      )}
                  />

                  <Controller
                      name="ctcAndEac.actualCtcStaff"
                      control={control}
                      render={({ field }) => (
                              <TextField
                                  fullWidth
                                  label="Staff"
                                  type="number"
                                  value={field.value}
                                  onChange={(e) => {
                                      const value = e.target.value ? Number(e.target.value) : null;
                                      field.onChange(value);
                                  }}
                                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                  error={!!errors.ctcAndEac?.actualCtcStaff}
                                  helperText={errors.ctcAndEac?.actualCtcStaff?.message || ''}
                                  sx={textFieldStyle}
                                  margin="normal"
                              />                       
                      )}
                  />
                  <Controller
                      name="ctcAndEac.actualCtcSubtotal"
                      control={control}
                      render={({ field }) => (
                          <TextField
                              fullWidth
                              label="Subtotal"
                              type="number"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              onWheel={(e) => (e.target as HTMLInputElement).blur()}
                              error={!!errors.ctcAndEac?.actualCtcSubtotal}
                              helperText={errors.ctcAndEac?.actualCtcSubtotal?.message || ''}
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
          
          <Grid item xs={12} md={3}>
              <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                      EAC(Estimated Actual Cost)
                  </Typography>
                  <Controller
                      name="ctcAndEac.eacOdc"
                      control={control}
                      render={() => (
                          <TextField
                              fullWidth
                              label="ODCs"
                              type="number"
                              value={(actualOdcs || 0) + (ctcODC || 0)}
                              InputProps={{
                                  readOnly: true,
                              }}
                              sx={textFieldStyle}
                              margin="normal"
                          />
                      )}
                  />
                  <Controller
                      name="ctcAndEac.eacStaff"
                      control={control}
                      render={() => (
                          <TextField
                              fullWidth
                              label="Staff"
                              type="number"
                              value={(actualStaff || 0) + (ctcStaff || 0)}
                              InputProps={{
                                  readOnly: true,
                              }}
                              sx={textFieldStyle}
                              margin="normal"
                          />
                      )}
                  />
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

              </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
              <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                      Gross Profit
                  </Typography>

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
