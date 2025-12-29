import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Grid,
  Chip,
  Button
} from '@mui/material';
import { CalendarToday, Person, Edit, Delete } from '@mui/icons-material';
import { Program } from '../types/types';

interface ProgramCardProps {
  program: Program;
  statusLabel: string;
  statusColor: 'default' | 'primary' | 'success';
  formattedStartDate: string;
  formattedEndDate: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

/**
 * DUMB COMPONENT - Pure presentation, no logic
 * Displays a single program card with provided data
 */
export const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  statusLabel,
  statusColor,
  formattedStartDate,
  formattedEndDate,
  onEdit,
  onDelete,
  onView,
  canEdit = false,
  canDelete = false
}) => {
  return (
    <Card 
      sx={{ 
        mb: 2, 
        border: 1, 
        borderColor: 'divider',
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
          <Chip label={statusLabel} color={statusColor} size="small" />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {program.description}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                <strong>Start:</strong> {formattedStartDate}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                <strong>End:</strong> {formattedEndDate}
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

      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        {onView && (
          <Button 
            size="small" 
            onClick={onView}
            variant="outlined"
          >
            View Details
          </Button>
        )}
        {canEdit && onEdit && (
          <Button 
            size="small" 
            onClick={onEdit}
            startIcon={<Edit />}
            color="primary"
          >
            Edit
          </Button>
        )}
        {canDelete && onDelete && (
          <Button 
            size="small" 
            onClick={onDelete}
            startIcon={<Delete />}
            color="error"
          >
            Delete
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
