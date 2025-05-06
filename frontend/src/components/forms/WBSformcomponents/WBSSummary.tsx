import React from 'react';
import {
  Box,
  Divider,
  Typography,
  styled
} from '@mui/material';
import LoadingButton from '../../common/LoadingButton';


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
  loading: boolean;
}

const WBSSummary: React.FC<WBSSummaryProps> = ({
  totalHours,
  totalCost,
  currency,
  disabled,
  onSave,
  loading
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
      <LoadingButton 
      onClick={onSave}
      loading={loading}
      disabled={disabled}
      text='Save'
      loadingText='Saving...'
      size='medium'
      />
    </Box>
  );
};

export default WBSSummary;
