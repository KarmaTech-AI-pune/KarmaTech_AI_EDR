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
  const { formType, currentUser } = useWBSDataContext();
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
    isUnderApproval,
  } = useWBSHeaderLogic({ formType });

  const taskType = formType === 'manpower' ? TaskType.Manpower : TaskType.ODC;

  const isProjectManager = currentUser?.roleDetails?.name === 'Project Manager';
  // Check if status is "Review Changes" (3) or "Approval Changes" (5)
  const isRejectionStatus = [3, 5].includes(statusId);

  // Edit is allowed if:
  // 1. Not under approval (2, 4, 6)
  // 2. AND (Not in rejection status OR (In rejection status AND user is PM))
  const canEdit = !isUnderApproval && (!isRejectionStatus || isProjectManager);

  // Auto-exit edit mode if permissions change while editing
  React.useEffect(() => {
    console.log('WBSHeader Auto-Exit Check:', { editMode, canEdit, isUnderApproval, status, statusId });
    // editMode = true means READ ONLY. editMode = false means EDITING.
    // If we are EDITING (!editMode) and we CANNOT edit (!canEdit), then toggle to Read Only.
    if (!editMode && !canEdit) {
      console.log('Force exiting edit mode (Switching to Read Only)');
      onEditModeToggle();
    }
  }, [editMode, canEdit, onEditModeToggle, isUnderApproval, status, statusId]);

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
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onEditModeToggle}
            >
              {editMode ? 'Edit Mode' : 'Exit Edit Mode'}
            </Button>
          )}
          {!editMode && canEdit && (
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
