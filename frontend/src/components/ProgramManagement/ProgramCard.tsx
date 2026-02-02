import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Program } from '../../types/program';

interface ProgramCardProps {
  program: Program;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ 
  program
}) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          {program.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {program.description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Start: {program.startDate ? new Date(program.startDate).toLocaleDateString() : 'N/A'}
          </Typography>
          {program.endDate && (
            <Typography variant="caption" color="text.secondary">
              End: {new Date(program.endDate).toLocaleDateString()}
            </Typography>
          )}
        </Box>
        
        {/* Action buttons will be added in later tasks */}
      </CardContent>
    </Card>
  );
};

export default ProgramCard;
