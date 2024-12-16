import React from 'react';
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Select,
    MenuItem,
    Button
} from '@mui/material';
import { MonthlyReviewModel } from '../../../models/monthlyReviewModel';

interface ChangeOrdersTabProps {
    formData: MonthlyReviewModel;
    handleInputChange: (path: string, value: any) => void;
}

export const ChangeOrdersTab: React.FC<ChangeOrdersTabProps> = ({
    formData,
    handleInputChange
}) => {
    const changeOrders = formData.changeOrders || { proposed: [], submitted: [], approved: [] };

    const commonInputStyles = {
        '& .MuiInputBase-root': {
            height: '36px'
        },
        '& .MuiOutlinedInput-input': {
            height: '36px',
            padding: '0 14px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center'
        }
    };

    return (
        <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Change Orders Summary
            </Typography>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Contract Total</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Cost</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Fee</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Summary Details</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(['proposed', 'submitted', 'approved'] as const).map((status) => (
                            changeOrders[status]?.map((row, index) => (
                                <TableRow key={`${status}-${index}`}>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={row.contractTotal || ''}
                                            onChange={(e) => {
                                                const newChangeOrders = { ...changeOrders };
                                                if (!newChangeOrders[status]) {
                                                    newChangeOrders[status] = [];
                                                }
                                                newChangeOrders[status][index] = {
                                                    ...row,
                                                    contractTotal: e.target.value === '' ? null : Number(e.target.value)
                                                };
                                                handleInputChange('changeOrders', newChangeOrders);
                                            }}
                                            fullWidth
                                            sx={commonInputStyles}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={row.cost || ''}
                                            onChange={(e) => {
                                                const newChangeOrders = { ...changeOrders };
                                                if (!newChangeOrders[status]) {
                                                    newChangeOrders[status] = [];
                                                }
                                                newChangeOrders[status][index] = {
                                                    ...row,
                                                    cost: e.target.value === '' ? null : Number(e.target.value)
                                                };
                                                handleInputChange('changeOrders', newChangeOrders);
                                            }}
                                            fullWidth
                                            sx={commonInputStyles}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={row.fee || ''}
                                            onChange={(e) => {
                                                const newChangeOrders = { ...changeOrders };
                                                if (!newChangeOrders[status]) {
                                                    newChangeOrders[status] = [];
                                                }
                                                newChangeOrders[status][index] = {
                                                    ...row,
                                                    fee: e.target.value === '' ? null : Number(e.target.value)
                                                };
                                                handleInputChange('changeOrders', newChangeOrders);
                                            }}
                                            fullWidth
                                            sx={commonInputStyles}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            size="small"
                                            value={row.summaryDetails}
                                            onChange={(e) => {
                                                const newChangeOrders = { ...changeOrders };
                                                if (!newChangeOrders[status]) {
                                                    newChangeOrders[status] = [];
                                                }
                                                newChangeOrders[status][index] = {
                                                    ...row,
                                                    summaryDetails: e.target.value
                                                };
                                                handleInputChange('changeOrders', newChangeOrders);
                                            }}
                                            fullWidth
                                            sx={commonInputStyles}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            size="small"
                                            value={row.status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value as 'Proposed' | 'Submitted' | 'Approved';
                                                const newChangeOrders = { ...changeOrders };
                                                
                                                // Ensure arrays exist
                                                if (!newChangeOrders[status]) newChangeOrders[status] = [];
                                                if (!newChangeOrders[newStatus.toLowerCase() as keyof typeof newChangeOrders]) {
                                                    newChangeOrders[newStatus.toLowerCase() as keyof typeof newChangeOrders] = [];
                                                }
                                                
                                                // Remove from current status array
                                                newChangeOrders[status] = 
                                                    newChangeOrders[status].filter((_, i) => i !== index);
                                                
                                                // Add to new status array
                                                newChangeOrders[newStatus.toLowerCase() as keyof typeof newChangeOrders].push({
                                                    ...row,
                                                    status: newStatus
                                                });
                                                
                                                handleInputChange('changeOrders', newChangeOrders);
                                            }}
                                            fullWidth
                                            sx={{
                                                ...commonInputStyles,
                                                '& .MuiSelect-select': {
                                                    padding: '0 14px'
                                                }
                                            }}
                                        >
                                            <MenuItem value="Proposed">Proposed</MenuItem>
                                            <MenuItem value="Submitted">Submitted</MenuItem>
                                            <MenuItem value="Approved">Approved</MenuItem>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Button
                variant="outlined"
                onClick={() => {
                    const newChangeOrders = { ...changeOrders };
                    if (!newChangeOrders.proposed) {
                        newChangeOrders.proposed = [];
                    }
                    newChangeOrders.proposed.push({
                        contractTotal: null,
                        cost: null,
                        fee: null,
                        summaryDetails: '',
                        status: 'Proposed'
                    });
                    handleInputChange('changeOrders', newChangeOrders);
                }}
                sx={{ mt: 2 }}
            >
                Add Change Order
            </Button>
        </Paper>
    );
};
