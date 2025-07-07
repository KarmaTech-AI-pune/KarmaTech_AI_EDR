import React, { useEffect, useContext } from "react";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Controller, useFormContext } from "react-hook-form";
import { Grid, Paper, TextField, Typography, CircularProgress, FormControlLabel, Checkbox } from "@mui/material";
import { formatCurrency } from "../../../../utils/MonthlyProgress/monthlyProgressUtils";
import { projectManagementAppContext } from "../../../../App";
import textFieldStyle from "../../../../theme/textFieldStyle";
import { getJobStartFormByProjectId, getWBSResourceData } from "../../../../services/jobStartFormApi";

const FinancialDetailsTab: React.FC = () => {
    const { control, formState: { errors }, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();
    const context = useContext(projectManagementAppContext);
    const projectId = context?.selectedProject?.id?.toString();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const [wbsResourcesLoading, setWbsResourcesLoading] = React.useState<boolean>(false);
    const [wbsResourcesError, setWbsResourcesError] = React.useState<string | null>(null);

    // Watch for calculation fields
    const net = watch("financialAndContractDetails.net");
    const serviceTax = watch("financialAndContractDetails.serviceTax");
    const odcs = watch("financialAndContractDetails.budgetOdcs");
    const staff = watch("financialAndContractDetails.budgetStaff");
    const contractType = watch("financialAndContractDetails.contractType");

    // Fetch Job Start Form data when component mounts
    useEffect(() => {
        if (projectId) {
            const fetchJobStartFormData = async () => {
                try {
                    setLoading(true);
                    setError(null);
                    const data = await getJobStartFormByProjectId(projectId);
                    if (data && Array.isArray(data) && data.length > 0) {
                        const jobStartForm = data[0];
                        // Extract values and set them in the form
                        setValue("financialAndContractDetails.net", jobStartForm.projectFees || null);
                        setValue("financialAndContractDetails.serviceTax", jobStartForm.serviceTaxPercentage || null);
                        setValue("budgetTable.originalBudget.cost", jobStartForm.grandTotal || 0)
                        setValue("budgetTable.originalBudget.revenueFee", jobStartForm.projectFees || 0)
                        setValue("budgetTable.originalBudget.profitPercentage", jobStartForm.projectFees || 0)
                        setValue("budgetTable.currentBudgetInMIS.revenueFee", jobStartForm.projectFees || 0)
                    }
                } catch (error) {
                    console.error("Error fetching Job Start Form data:", error);
                    setError("Failed to load Job Start Form data");
                } finally {
                    setLoading(false);
                }
            };
            
            fetchJobStartFormData();
        }
    }, [projectId, setValue]);

    // Fetch WBS resource data when component mounts
    useEffect(() => {
        if (projectId) {
            const fetchWBSResourceData = async () => {
                try {
                    setWbsResourcesLoading(true);
                    setWbsResourcesError(null);
                    
                    const wbsData = await getWBSResourceData(projectId);
                    
                    // Process the data to extract budgetOdcs and budgetStaff
                    if (wbsData && wbsData.resourceAllocations) {
                        // Calculate total ODC costs (taskType === 1)
                        const totalODCs = wbsData.resourceAllocations
                            .filter((allocation: any) => allocation.taskType === 1)
                            .reduce((sum: number, allocation: any) => sum + allocation.totalCost, 0);
                            
                        // Calculate total Staff costs (taskType === 0)
                        const totalStaff = wbsData.resourceAllocations
                            .filter((allocation: any) => allocation.taskType === 0)
                            .reduce((sum: number, allocation: any) => sum + allocation.totalCost, 0);
                        
                        // Set the values in the form
                        setValue("financialAndContractDetails.budgetOdcs", totalODCs);
                        setValue("financialAndContractDetails.budgetStaff", totalStaff);
                    }
                } catch (error) {
                    console.error("Error fetching WBS resource data:", error);
                    setWbsResourcesError("Failed to load WBS resource data");
                } finally {
                    setWbsResourcesLoading(false);
                }
            };
            
            fetchWBSResourceData();
        }
    }, [projectId, setValue]);

    // Auto-calculate totals
    useEffect(() => {
        if (net != null && serviceTax != null) {
            const feeTotal = net + (net * serviceTax / 100);
            setValue("financialAndContractDetails.feeTotal", feeTotal);
        }
    }, [net, serviceTax, setValue]);

    useEffect(() => {
        if (odcs != null && staff != null) {
            const budgetSubTotal = odcs + staff;
            setValue("financialAndContractDetails.BudgetSubTotal", budgetSubTotal);
        }
    }, [odcs, staff, setValue]);


    return (
        <Grid container spacing={3}>
            
            <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">Fees</Typography>
                    <Controller
                        name="financialAndContractDetails.net"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="Net"
                                    type="text"
                                    {...field}
                                    error={!!errors.financialAndContractDetails?.net}
                                    helperText={errors.financialAndContractDetails?.net?.message || ''}
                                    value={field.value != null ? formatCurrency(field.value) : ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="financialAndContractDetails.serviceTax"
                        control={control}
                        render={({ field }) => (
                        
                                <TextField
                                    fullWidth
                                    label="Service Tax (%)"
                                    error={!!errors.financialAndContractDetails?.serviceTax}
                                    helperText={errors.financialAndContractDetails?.serviceTax?.message || ''}
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="financialAndContractDetails.feeTotal"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="Total"
                                    type="text"
                                    error={!!errors.financialAndContractDetails?.feeTotal}
                                    helperText={errors.financialAndContractDetails?.feeTotal?.message || ''}
                                    {...field}
                                    value={field.value != null ? formatCurrency(field.value) : ''}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">Budget Costs</Typography>
                    <Controller
                        name="financialAndContractDetails.budgetOdcs"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="ODCs"
                                    type="text"
                                    error={!!errors.financialAndContractDetails?.budgetOdcs}
                                    helperText={errors.financialAndContractDetails?.budgetOdcs?.message || ''}
                                    {...field}
                                    value={field.value != null ? formatCurrency(field.value) : ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="financialAndContractDetails.budgetStaff"
                        control={control}
                        render={({ field }) => (
                        
                                <TextField
                                    fullWidth
                                    label="Staff"
                                    type="text"
                                    error={!!errors.financialAndContractDetails?.budgetStaff}
                                    helperText={errors.financialAndContractDetails?.budgetStaff?.message || ''}
                                    {...field}
                                    value={field.value != null ? formatCurrency(field.value) : ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="financialAndContractDetails.BudgetSubTotal"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="Sub Total"
                                    type="text"
                                    error={!!errors.financialAndContractDetails?.BudgetSubTotal}
                                    helperText={errors.financialAndContractDetails?.BudgetSubTotal?.message || ''}
                                    {...field}
                                    value={field.value != null ? formatCurrency(field.value) : ''}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Contract Type
                      </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={contractType === 'lumpsum'}
                  onChange={() => {
                    setValue('financialAndContractDetails.contractType', 'lumpsum');
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
                    setValue('financialAndContractDetails.contractType', 'timeAndExpense');
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
                        name="financialAndContractDetails.percentage"
                        control={control}
                        render={({ field }) => (
                            <TextField
                              fullWidth
                              label="Percentage"
                              type="number"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              onWheel={(e) => (e.target as HTMLInputElement).blur()}
                              error={!!errors.financialAndContractDetails?.percentage}
                              helperText={errors.financialAndContractDetails?.percentage?.message || ''}
                              sx={textFieldStyle}
                              margin="normal"
                            />
                        )}
                      />
                    </Paper>
            </Grid>
        </Grid>
    );
};

export default FinancialDetailsTab;
