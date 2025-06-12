import React, { useEffect, useContext } from "react";
import { MonthlyProgressSchemaType } from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Controller, useFormContext } from "react-hook-form";
import { Grid, Paper, TextField, Typography, CircularProgress } from "@mui/material";
import { formatCurrency } from "../../../utils/MonthlyProgress/monthlyProgressUtils";
import { projectManagementAppContext } from "../../../App";
import { getJobStartFormByProjectId } from "../../../services/jobStartFormApi";

const FinancialDetailsTab: React.FC = () => {
    const { control, formState: { errors }, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();
    const context = useContext(projectManagementAppContext);
    const projectId = context?.selectedProject?.id?.toString();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    // Watch for calculation fields
    const net = watch("financialDetails.net");
    const serviceTax = watch("financialDetails.serviceTax");
    const odcs = watch("financialDetails.budgetOdcs");
    const staff = watch("financialDetails.budgetStaff");

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
                        setValue("financialDetails.net", jobStartForm.grandTotal || null);
                        setValue("financialDetails.serviceTax", jobStartForm.serviceTaxPercentage || null);
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

    // Auto-calculate totals
    React.useEffect(() => {
        if (net != null && serviceTax != null) {
            const feeTotal = net + (net * serviceTax / 100);
            setValue("financialDetails.feeTotal", feeTotal);
        }
    }, [net, serviceTax, setValue]);

    React.useEffect(() => {
        if (odcs != null && staff != null) {
            const budgetSubTotal = odcs + staff;
            setValue("financialDetails.BudgetSubTotal", budgetSubTotal);
        }
    }, [odcs, staff, setValue]);


    return (
        <Grid container spacing={3}>
            {loading && (
                <Grid item xs={12}>
                    <CircularProgress size={24} sx={{ ml: 2 }} />
                </Grid>
            )}
            {error && (
                <Grid item xs={12}>
                    <Typography color="error">{error}</Typography>
                </Grid>
            )}
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">Fees</Typography>
                    <Controller
                        name="financialDetails.net"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="Net"
                                    type="text"
                                    {...field}
                                    error={!!errors.financialDetails?.net}
                                    helperText={errors.financialDetails?.net?.message || ''}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="financialDetails.serviceTax"
                        control={control}
                        render={({ field }) => (
                        
                                <TextField
                                    fullWidth
                                    label="Service Tax (%)"
                                    error={!!errors.financialDetails?.serviceTax}
                                    helperText={errors.financialDetails?.serviceTax?.message || ''}
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    slotProps={{
                                        htmlInput: { min: 0, max: 100, step: 0.01 }
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="financialDetails.feeTotal"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="Total"
                                    type="text"
                                    error={!!errors.financialDetails?.feeTotal}
                                    helperText={errors.financialDetails?.feeTotal?.message || ''}
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

            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">Budget Costs</Typography>
                    <Controller
                        name="financialDetails.budgetOdcs"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="ODCs"
                                    type="text"
                                    error={!!errors.financialDetails?.budgetOdcs}
                                    helperText={errors.financialDetails?.budgetOdcs?.message || ''}
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="financialDetails.budgetStaff"
                        control={control}
                        render={({ field }) => (
                        
                                <TextField
                                    fullWidth
                                    label="Staff"
                                    type="text"
                                    error={!!errors.financialDetails?.budgetStaff}
                                    helperText={errors.financialDetails?.budgetStaff?.message || ''}
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="financialDetails.BudgetSubTotal"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="Sub Total"
                                    type="text"
                                    error={!!errors.financialDetails?.BudgetSubTotal}
                                    helperText={errors.financialDetails?.BudgetSubTotal?.message || ''}
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
        </Grid>
    );
};

export default FinancialDetailsTab;
