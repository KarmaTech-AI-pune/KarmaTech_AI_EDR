import React, { useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  styled
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { ProjectTrackingWorkflow } from '../../dialogbox/ProjectReviewWorkflow/ProjectTrackingWorkflow';
import { projectManagementAppContext } from '../../../App';

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
  const context = useContext(projectManagementAppContext);
  const statusId = "Initial"; // Capitalized to match the case in the component
  const projectId = context?.selectedProject?.id ? Number(context.selectedProject.id) : undefined;

  const handleStatusUpdate = (newStatus: string) => {
    console.log("WBS Status updated to:", newStatus);
    // You can add additional logic here to handle status updates
  };

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
        {editMode && (
            <ProjectTrackingWorkflow
              statusId={statusId}
              projectId={projectId}
              onStatusUpdate={handleStatusUpdate}
            />
          )}
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
