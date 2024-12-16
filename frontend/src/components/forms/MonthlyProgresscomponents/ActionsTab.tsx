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
    Button,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { MonthlyReviewModel } from '../../../models/monthlyReviewModel';

interface ActionsTabProps {
    formData: MonthlyReviewModel;
    handleInputChange: (path: string, value: any) => void;
}

export const ActionsTab: React.FC<ActionsTabProps> = ({
    formData,
    handleInputChange
}) => {
    return (
        <>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Actions from last month
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Actions</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Comments</TableCell>
                                <TableCell width={50}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {formData.lastMonthActions.map((action, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={action.description}
                                            onChange={(e) => {
                                                const newActions = [...formData.lastMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    description: e.target.value
                                                };
                                                handleInputChange('lastMonthActions', newActions);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="date"
                                            size="small"
                                            value={action.date}
                                            onChange={(e) => {
                                                const newActions = [...formData.lastMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    date: e.target.value
                                                };
                                                handleInputChange('lastMonthActions', newActions);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={action.comments}
                                            onChange={(e) => {
                                                const newActions = [...formData.lastMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    comments: e.target.value
                                                };
                                                handleInputChange('lastMonthActions', newActions);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                const newActions = formData.lastMonthActions.filter((_, i) => i !== index);
                                                handleInputChange('lastMonthActions', newActions);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        const newActions = [...formData.lastMonthActions];
                        newActions.push({
                            description: '',
                            date: '',
                            comments: '',
                            priority: undefined
                        });
                        handleInputChange('lastMonthActions', newActions);
                    }}
                    sx={{ mt: 2 }}
                >
                    Add Action
                </Button>
            </Paper>

            <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Actions and Priorities for this month
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Actions</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Comments</TableCell>
                                <TableCell>H/M/L</TableCell>
                                <TableCell width={50}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {formData.currentMonthActions.map((action, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={action.description}
                                            onChange={(e) => {
                                                const newActions = [...formData.currentMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    description: e.target.value
                                                };
                                                handleInputChange('currentMonthActions', newActions);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="date"
                                            size="small"
                                            value={action.date}
                                            onChange={(e) => {
                                                const newActions = [...formData.currentMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    date: e.target.value
                                                };
                                                handleInputChange('currentMonthActions', newActions);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={action.comments}
                                            onChange={(e) => {
                                                const newActions = [...formData.currentMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    comments: e.target.value
                                                };
                                                handleInputChange('currentMonthActions', newActions);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            size="small"
                                            value={action.priority || ''}
                                            onChange={(e) => {
                                                const newActions = [...formData.currentMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    priority: e.target.value as 'H' | 'M' | 'L'
                                                };
                                                handleInputChange('currentMonthActions', newActions);
                                            }}
                                            fullWidth
                                        >
                                            <MenuItem value="H">H</MenuItem>
                                            <MenuItem value="M">M</MenuItem>
                                            <MenuItem value="L">L</MenuItem>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                const newActions = formData.currentMonthActions.filter((_, i) => i !== index);
                                                handleInputChange('currentMonthActions', newActions);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        const newActions = [...formData.currentMonthActions];
                        newActions.push({
                            description: '',
                            date: '',
                            comments: '',
                            priority: 'M'
                        });
                        handleInputChange('currentMonthActions', newActions);
                    }}
                    sx={{ mt: 2 }}
                >
                    Add Action
                </Button>
            </Paper>
        </>
    );
};
