import React from 'react';
import {
  Box,
  Button,
  Divider,
  Typography,
  styled
} from '@mui/material';

const SummaryText = styled(Typography)({
  fontWeight: 500,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px'
});

interface WBSSummaryProps {
  totalHours: number;
  totalCost: number;
  currency: string;
  disabled: boolean;
  onSave: () => void;
}

const WBSSummary: React.FC<WBSSummaryProps> = ({
  totalHours,
  totalCost,
  currency,
  disabled,
  onSave
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 3,
      p: 1
    }}>
      <SummaryText>
        Total Hours: {totalHours}
      </SummaryText>
      <Divider orientation="vertical" flexItem />
      <SummaryText>
        Total Cost: {currency} {totalCost.toLocaleString()}
      </SummaryText>
      <Button
        variant="contained"
        onClick={onSave}
        disabled={disabled}
        size="small"
      >
        Save
      </Button>
    </Box>
  );
};

export default WBSSummary;
