import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  styled
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  padding: theme.spacing(2),
  '& .MuiTypography-root': {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    fontWeight: 'bold'
  },
  '& .MuiButton-root': {
    marginLeft: 'auto'
  }
}));

interface WBSHeaderProps {
  editMode: boolean;
  error: string;
  onEditModeToggle: () => void;
  onAddMonth: () => void;
}

const WBSHeader: React.FC<WBSHeaderProps> = ({
  editMode,
  error,
  onEditModeToggle,
  onAddMonth
}) => {
  return (
    <>
      <StyledHeaderBox>
        <Typography variant="h6">
          PMD2. Work Breakdown Structure
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEditModeToggle}
          >
            {editMode ? 'Edit Mode' : 'Exit Edit Mode'}
          </Button>
          {!editMode && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onAddMonth}
            >
              Add Month
            </Button>
          )}
        </Box>
      </StyledHeaderBox>

      {error && (
        <Alert severity="error" sx={{ mt: 2, mx: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
    </>
  );
};

export default WBSHeader;
