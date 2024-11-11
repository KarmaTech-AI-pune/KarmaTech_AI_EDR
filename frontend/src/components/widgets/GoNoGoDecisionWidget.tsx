/*import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Project } from '../../types';

interface GoNoGoDecisionWidgetProps {
  project: Project;
  goNoGoDecision: any;
  onEdit?: () => void;
}

const GoNoGoDecisionWidget: React.FC<GoNoGoDecisionWidgetProps> = ({ 
  project, 
  goNoGoDecision, 
  onEdit,
}) => {
  const getDecisionStatus = (totalScore: number) => {
    if (totalScore >= 84) return { text: 'GO [Green]', color: '#4caf50' };
    if (totalScore >= 50) return { text: 'GO [Amber]', color: '#ff9800' };
    return { text: 'NO GO [Red]', color: '#f44336' };
  };

  // Safely extract decision data with default values
  const headerInfo = goNoGoDecision?.headerInfo || {};
  const totalScore = goNoGoDecision?.totalScore || 0;

  if (!goNoGoDecision) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Go/No Go Decision
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No decision has been made yet.
        </Typography>
        {onEdit && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={onEdit}
            sx={{ mt: 2 }}
          >
            Make Decision
          </Button>
        )}
      </Paper>
    );
  }

  const status = getDecisionStatus(totalScore);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Go/No Go Decision
        </Typography>
        {onEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEdit}
          >
            Edit Decision
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" color="text.secondary">
            Type of Bid: {headerInfo.typeOfBid || 'Not Specified'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sector: {headerInfo.sector || 'Not Specified'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" color="text.secondary">
            BD Head: {headerInfo.bdHead || 'Not Specified'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Office: {headerInfo.office || 'Not Specified'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body1">
              Total Score: {totalScore}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: status.color, fontWeight: 'bold', mt: 1 }}
            >
              Decision Status: {status.text}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GoNoGoDecisionWidget;
*/