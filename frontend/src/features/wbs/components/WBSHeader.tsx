import React from 'react';
import {
  Box,
  Typography,
  Button,
  styled
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { ProjectTrackingWorkflow } from '../../../components/common/ProjectTrackingWorkflow';
import { useWBSDataContext } from '../context/WBSContext';
import { TaskType } from '../types/wbs';
import { useWBSHeaderLogic } from '../hooks/useWBSHeaderLogic'; // Corrected import path


const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  '& .MuiButton-root': {
    marginLeft: 'auto'
  }
}));

const WBSHeader: React.FC = () => {
  const { formType } = useWBSDataContext();
  const {
    title,
    status,
    statusId,
    isLoading,
    wbsHeaderId,
    projectId,
    editMode,
    addNewMonth,
    onEditModeToggle,
    handleStatusUpdate,
  } = useWBSHeaderLogic({ formType });

  const taskType = formType === 'manpower' ? TaskType.Manpower : TaskType.ODC;

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
        {editMode && !isLoading && wbsHeaderId && projectId && (
            <ProjectTrackingWorkflow
              projectId={projectId.toString()}
              status={status}
              statusId={statusId}
              entityId={wbsHeaderId}
              entityType="WBS"
              formType={taskType}
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
              onClick={addNewMonth}
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
