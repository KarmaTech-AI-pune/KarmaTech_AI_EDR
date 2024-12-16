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
    List,
    ListItem
} from '@mui/material';
import { MonthlyReviewModel } from '../../../models/monthlyReviewModel';

interface ManpowerPlanningTabProps {
    formData: MonthlyReviewModel;
    handleInputChange: (path: string, value: any) => void;
}

export const ManpowerPlanningTab: React.FC<ManpowerPlanningTabProps> = ({
    formData,
    handleInputChange
}) => {
    const inputStyles = {
        '& .MuiInputBase-root': {
            height: '40px'
        },
        '& .MuiOutlinedInput-input': {
            padding: '8px 14px'
        }
    };

    const commentInputStyles = {
        '& .MuiInputBase-root': {
            height: '40px'
        },
        '& .MuiOutlinedInput-input': {
            padding: '8px 14px',
            overflow: 'auto'
        }
    };

    return (
        <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Manpower Planned for Remaining Works
            </Typography>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '20%', padding: '12px' }}>Work Assignment</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '25%', padding: '12px' }}>Assignee</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%', padding: '12px' }}>Planned</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%', padding: '12px' }}>Consumed</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%', padding: '12px' }}>Balance</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%', padding: '12px' }}>Next Month's Planning</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%', padding: '12px' }}>Comments</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {formData.manpowerPlanning.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell sx={{ padding: '12px' }}>{row.workAssignment}</TableCell>
                                <TableCell sx={{ padding: '12px' }}>
                                    <List dense disablePadding>
                                        {row.assignee.map((name, idx) => (
                                            <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                                                {name}
                                            </ListItem>
                                        ))}
                                    </List>
                                </TableCell>
                                <TableCell sx={{ padding: '12px' }}>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={row.planned || ''}
                                        onChange={(e) => {
                                            const newManpowerPlanning = [...formData.manpowerPlanning];
                                            newManpowerPlanning[index] = {
                                                ...newManpowerPlanning[index],
                                                planned: e.target.value === '' ? null : Number(e.target.value)
                                            };
                                            handleInputChange('manpowerPlanning', newManpowerPlanning);
                                        }}
                                        fullWidth
                                        sx={inputStyles}
                                    />
                                </TableCell>
                                <TableCell sx={{ padding: '12px' }}>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={row.consumed || ''}
                                        onChange={(e) => {
                                            const newManpowerPlanning = [...formData.manpowerPlanning];
                                            newManpowerPlanning[index] = {
                                                ...newManpowerPlanning[index],
                                                consumed: e.target.value === '' ? null : Number(e.target.value)
                                            };
                                            handleInputChange('manpowerPlanning', newManpowerPlanning);
                                        }}
                                        fullWidth
                                        sx={inputStyles}
                                    />
                                </TableCell>
                                <TableCell sx={{ padding: '12px' }}>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={row.balance || ''}
                                        onChange={(e) => {
                                            const newManpowerPlanning = [...formData.manpowerPlanning];
                                            newManpowerPlanning[index] = {
                                                ...newManpowerPlanning[index],
                                                balance: e.target.value === '' ? null : Number(e.target.value)
                                            };
                                            handleInputChange('manpowerPlanning', newManpowerPlanning);
                                        }}
                                        fullWidth
                                        sx={inputStyles}
                                    />
                                </TableCell>
                                <TableCell sx={{ padding: '12px' }}>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={row.nextMonthPlanning || ''}
                                        onChange={(e) => {
                                            const newManpowerPlanning = [...formData.manpowerPlanning];
                                            newManpowerPlanning[index] = {
                                                ...newManpowerPlanning[index],
                                                nextMonthPlanning: e.target.value === '' ? null : Number(e.target.value)
                                            };
                                            handleInputChange('manpowerPlanning', newManpowerPlanning);
                                        }}
                                        fullWidth
                                        sx={inputStyles}
                                    />
                                </TableCell>
                                <TableCell sx={{ padding: '12px' }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={row.comments}
                                        onChange={(e) => {
                                            const newManpowerPlanning = [...formData.manpowerPlanning];
                                            newManpowerPlanning[index] = {
                                                ...newManpowerPlanning[index],
                                                comments: e.target.value
                                            };
                                            handleInputChange('manpowerPlanning', newManpowerPlanning);
                                        }}
                                        sx={commentInputStyles}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={2} sx={{ fontWeight: 'bold', padding: '12px' }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', padding: '12px' }}>
                                {formData.manpowerPlanning.reduce((sum, row) => sum + (row.planned || 0), 0)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', padding: '12px' }}>
                                {formData.manpowerPlanning.reduce((sum, row) => sum + (row.consumed || 0), 0)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', padding: '12px' }}>
                                {formData.manpowerPlanning.reduce((sum, row) => sum + (row.balance || 0), 0)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', padding: '12px' }}>
                                {formData.manpowerPlanning.reduce((sum, row) => sum + (row.nextMonthPlanning || 0), 0)}
                            </TableCell>
                            <TableCell sx={{ padding: '12px' }} />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};
