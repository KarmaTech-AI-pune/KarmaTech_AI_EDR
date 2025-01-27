import React from 'react';
import {
    Grid,
    Paper,
    Typography
} from '@mui/material';
import { InputField } from './InputField';
import { MonthlyReviewModel } from '../../../models/monthlyReviewModel';

interface BudgetAndScheduleTabProps {
    formData: MonthlyReviewModel;
    handleInputChange: (path: string, value: any) => void;
}

export const BudgetAndScheduleTab: React.FC<BudgetAndScheduleTabProps> = ({
    formData,
    handleInputChange
}) => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Schedule</Typography>
                    <InputField
                        label="Date of issue of WO/LOI"
                        value={formData.schedule.dateOfIssueWOLOI}
                        onChange={(value) => handleInputChange('schedule.dateOfIssueWOLOI', value)}
                        type="date"
                        tooltip="Work Order/Letter of Intent issue date"
                    />
                    <InputField
                        label="Completion Date (Contract)"
                        value={formData.schedule.completionDateAsPerContract}
                        onChange={(value) => handleInputChange('schedule.completionDateAsPerContract', value)}
                        type="date"
                        tooltip="Original completion date as per contract"
                    />
                    <InputField
                        label="Expected Completion Date"
                        value={formData.schedule.expectedCompletionDate}
                        onChange={(value) => handleInputChange('schedule.expectedCompletionDate', value)}
                        type="date"
                        tooltip="Current expected completion date"
                    />
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Completion Status</Typography>
                    <InputField
                        label="% Complete on costs"
                        value={formData.completion.percentCompleteOnCosts}
                        onChange={(value) => handleInputChange('completion.percentCompleteOnCosts', value)}
                        tooltip="Percentage completion based on costs"
                    />
                    <InputField
                        label="% Complete on EV (PPC)"
                        value={formData.completion.percentCompleteOnEV}
                        onChange={(value) => handleInputChange('completion.percentCompleteOnEV', value)}
                        tooltip="Percentage completion based on Earned Value"
                    />
                    <InputField
                        label="SPI"
                        value={formData.schedule.spi}
                        onChange={(value) => handleInputChange('schedule.spi', value)}
                        tooltip="Schedule Performance Index"
                    />
                </Paper>
            </Grid>
        </Grid>
    );
};
