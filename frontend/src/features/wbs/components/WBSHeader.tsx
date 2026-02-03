import React, { useEffect } from 'react';
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
    selectedProject,
    currentUser: contextUser
  } = useWBSHeaderLogic({ formType });

  const taskType = formType === 'manpower' ? TaskType.Manpower : TaskType.ODC;

  // Use user from context
  const user = currentUser || contextUser;
  // Safely cast project to access manager IDs (assuming it is a Project type)
  const project = selectedProject as any;

  const currentUserId = user?.id;
  
  // Role checks
  const isAssignedPM = currentUserId && project?.projectManagerId === currentUserId;
  const isAssignedSPM = currentUserId && project?.seniorProjectManagerId === currentUserId;
  const isAssignedRM = currentUserId && project?.regionalManagerId === currentUserId;
  const isRegionalDirector = user?.roleDetails?.name === 'Regional Director';

  let canEdit = false;

  // Logic based on requirements:
  // 1. While PM is editing (Initial[1], Review Changes[3]): Only PM sees Edit.
  //    Also (No Form[0]) and (Approved[6]) per new requirement.
  //    NOTE: Approval Changes[5] moved to SPM.
  if ([0, 1, 3, 6].includes(statusId)) {
    if (isAssignedPM) canEdit = true;
  }
  // 2. After PM submits to SPM (Sent for Review[2]): Only SPM sees Edit.
  //    Also Approval Changes[5] (RM Rejection)
  else if (statusId === 2 || statusId === 5) {
    if (isAssignedSPM) canEdit = true;
  }
  // 3. After SPM sends for approval (Sent for Approval[4]): Only assigned RM or RD sees Edit.
  else if (statusId === 4) {
    if (isAssignedRM || isRegionalDirector) canEdit = true;
  }
  // Else: canEdit remains false.

  // Auto-exit edit mode if permissions change while editing
  useEffect(() => {
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