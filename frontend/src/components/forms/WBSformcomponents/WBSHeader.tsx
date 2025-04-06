import React from 'react';
import {
  Box,
  Typography,
  Button,
  styled
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  '& .MuiButton-root': {
    marginLeft: 'auto'
  }
}));

interface WBSHeaderProps {
  title: string;
  editMode: boolean;
  onEditModeToggle: () => void;
  onAddMonth: () => void;
}

const WBSHeader: React.FC<WBSHeaderProps> = ({
  title,
  editMode,
  onEditModeToggle,
  onAddMonth
}) => {
  return (
    <>
      <StyledHeaderBox>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#1976d2',
            fontWeight: 500,
            mb: 0
          }}
        >
          {title}
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
    </>
  );
};

export default WBSHeader;
