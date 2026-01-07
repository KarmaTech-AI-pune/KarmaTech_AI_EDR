import React from 'react';
import {
  Box,
  Typography,
  List,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button
} from '@mui/material';
import { CalendarToday, Person, Edit, Delete } from '@mui/icons-material';
import { Program } from '../types/types';

export interface ProgramListProps {
  programs: Program[];
  emptyMessage?: string;
  onProgramDeleted?: (programId: number) => void;
  onProgramUpdated?: () => void;
  onEditProgram?: (program: Program) => void;
  onViewProgram?: (program: Program) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ProgramList: React.FC<ProgramListProps> = ({
  programs,
  emptyMessage = 'No programs found',
  onProgramDeleted,
  onEditProgram,
  onViewProgram,
  canEdit = false,
  canDelete = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusChip = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return <Chip label="Not Started" color="default" size="small" />;
    } else if (now >= start && now <= end) {
      return <Chip label="Active" color="primary" size="small" />;
    } else {
      return <Chip label="Completed" color="success" size="small" />;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {programs.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          width="100%"
        >
          <Typography variant="body1" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%', p: 0 }}>
          {programs.map((program) => (
            <Card 
              key={program.id} 
              onClick={() => onViewProgram && onViewProgram(program)}
              sx={{ 
                mb: 2, 
                border: 1, 
                borderColor: 'divider',
                cursor: onViewProgram ? 'pointer' : 'default',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h3" sx={{ color: 'primary.main', flexGrow: 1 }}>
                    {program.name}
                  </Typography>
                  {getStatusChip(program.startDate, program.endDate)}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {program.description}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Start:</strong> {formatDate(program.startDate)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        <strong>End:</strong> {formatDate(program.endDate)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Created by:</strong> {program.createdBy}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>

              {(canEdit && onEditProgram) || (canDelete && onProgramDeleted) ? (
                <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                  {canEdit && onEditProgram && (
                    <Button 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        onEditProgram(program);
                      }}
                      startIcon={<Edit />}
                      color="primary"
                    >
                      Edit
                    </Button>
                  )}
                  {canDelete && onProgramDeleted && (
                    <Button 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        onProgramDeleted(program.id);
                      }}
                      startIcon={<Delete />}
                      color="error"
                    >
                      Delete
                    </Button>
                  )}
                </CardActions>
              ) : null}
            </Card>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ProgramList;
