import React from 'react';
import {
  Box,
  Divider,
  Typography,
  styled
} from '@mui/material';
import LoadingButton from '../../../components/common/LoadingButton';


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
  formType: 'manpower' | 'odc';
}

const WBSSummary: React.FC<WBSSummaryProps> = ({
  totalHours,
  totalCost,
  currency,
  disabled,
  onSave,
  loading,
  formType
}) => {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 3,
      p: 1
    }}>
      {formType !== 'odc' && (
        <>
          <SummaryText>
            Total Hours: {Number(totalHours).toFixed(2)}
          </SummaryText>
          <Divider orientation="vertical" flexItem />
        </>
      )}
      <SummaryText>
        Total Cost: {currency} {Number(totalCost).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </SummaryText>
      {!disabled && (
        <LoadingButton
          onClick={onSave}
          loading={loading}
          disabled={disabled}
          text='Save'
          loadingText='Saving...'
          size='medium'
        />
      )}
    </Box>
  );
};

export default WBSSummary;