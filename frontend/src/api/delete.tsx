import React from 'react';
import {
    Grid,
    Paper,
    Typography,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { InputField } from './InputField';
import { MonthlyReviewModel } from '../../../models/monthlyReviewModel';

interface ContractAndCostsTabProps {
    formData: MonthlyReviewModel;
    handleInputChange: (path: string, value: any) => void;
    formatCurrency: (value: number | null) => string;
}

export const ContractAndCostsTab: React.FC<ContractAndCostsTabProps> = ({
    formData,
    handleInputChange,
    formatCurrency
}) => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Contract Type</Typography>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.contractType.lumpsum}
                                onChange={(e) => handleInputChange('contractType.lumpsum', e.target.checked)}
                            />
                        }
                        label="Lumpsum"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.contractType.tAndE}
                                onChange={(e) => handleInputChange('contractType.tAndE', e.target.checked)}
                            />
                        }
                        label="Time & Expense"
                    />
                    <InputField
                        label="Percentage"
                        value={formData.contractType.percentage}
                        onChange={(value) => handleInputChange('contractType.percentage', value)}
                        tooltip="Contract percentage if applicable"
                    />
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Actual Costs</Typography>
                    <InputField
                        label="ODCs"
                        value={formData.actualCosts.odcs}
                        onChange={(value) => handleInputChange('actualCosts.odcs', value)}
                        tooltip="Actual Other Direct Costs"
                    />
                    <InputField
                        label="Staff"
                        value={formData.actualCosts.staff}
                        onChange={(value) => handleInputChange('actualCosts.staff', value)}
                        tooltip="Actual staff costs"
                    />
                    <InputField
                        label="Subtotal"
                        value={formData.actualCosts.subtotal != null ? formatCurrency(formData.actualCosts.subtotal) : ''}
                        readOnly
                        tooltip="Automatically calculated actual costs subtotal"
                    />
                </Paper>
            </Grid>
        </Grid>
    );
};