import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Grid,
    Collapse,
    Divider
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Project } from '../../models/projectModel';

interface ProjectHeaderWidgetProps {
    project: Project;
}

export const ProjectHeaderWidget: React.FC<ProjectHeaderWidgetProps> = ({ project }) => {
    const [expanded, setExpanded] = useState(false);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not Set';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: project.currency || 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <Paper 
            elevation={0}
            sx={{ 
                mb: 1, // Reduced from mb: 3
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                backgroundColor: '#fff'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f8f9fa',
                    borderLeft: '3px solid #1976d2',
                    cursor: 'pointer',
                    minHeight: '40px', // Reduced from 48px
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                }}
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        width: '100%',
                        p: '8px 12px' // Reduced from 12px 16px
                    }}>
                        <Typography sx={{ fontWeight: 'bold' }}>PROJECT DETAILS</Typography>
                        <IconButton size="small">
                            <KeyboardArrowUpIcon />
                        </IconButton>
                    </Box>
                ) : (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        width: '100%',
                        p: '8px 12px' // Reduced from 12px 16px
                    }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={3}>
                                <Typography sx={{ color: '#2c3e50' }}>{project.clientName}</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography sx={{ color: '#1976d2', fontWeight: 500 }}>
                                    {formatCurrency(project.estimatedCost)}
                                </Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography sx={{ color: '#2c3e50' }}>{formatDate(project.startDate)}</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography sx={{ color: '#2c3e50' }}>{formatDate(project.endDate)}</Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <IconButton size="small">
                                    <KeyboardArrowDownIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Box>
            
            <Collapse in={expanded}>
                <Box sx={{ p: 2 }}> {/* Reduced from p: 3 */}
                    <Grid container spacing={2}> {/* Reduced from spacing: 3 */}
                        <Grid item xs={12} md={6}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Project Name</Typography>
                                    <Typography variant="body1">{project.name}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Project No.</Typography>
                                    <Typography variant="body1">{project.projectNo}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Client Name</Typography>
                                    <Typography variant="body1">{project.clientName}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Type of Client</Typography>
                                    <Typography variant="body1">{project.typeOfClient || 'Not Specified'}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Start Date</Typography>
                                    <Typography variant="body1">{formatDate(project.startDate)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">End Date</Typography>
                                    <Typography variant="body1">{formatDate(project.endDate)}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">Estimated Cost</Typography>
                                    <Typography variant="body1">{formatCurrency(project.estimatedCost)}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={3}>
                                    <Typography variant="subtitle2" color="textSecondary">Office</Typography>
                                    <Typography variant="body1">{project.office || 'Not Specified'}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="subtitle2" color="textSecondary">Sector</Typography>
                                    <Typography variant="body1">{project.sector || 'Not Specified'}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="subtitle2" color="textSecondary">Region</Typography>
                                    <Typography variant="body1">{project.region || 'Not Specified'}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="subtitle2" color="textSecondary">Priority</Typography>
                                    <Typography variant="body1">{project.priority || 'Not Set'}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Collapse>
        </Paper>
    );
};
