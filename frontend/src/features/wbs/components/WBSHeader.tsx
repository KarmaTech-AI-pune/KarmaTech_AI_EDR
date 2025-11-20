import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  styled
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { ProjectTrackingWorkflow } from '../../../components/common/ProjectTrackingWorkflow';
import { projectManagementAppContext } from '../../../App';
import { TaskType } from '../types/wbs';
import { wbsHeaderApi } from '../services/wbsHeaderApi';
import { useWBSDataContext, useWBSActionsContext } from '../context/WBSContext';

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
  const context = useContext(projectManagementAppContext);
  const projectId = context?.selectedProject?.id;
  
  // Get data and actions from context
  const { formType, editMode } = useWBSDataContext();
  const { addNewMonth, onEditModeToggle } = useWBSActionsContext();
  
  const [wbsHeaderId, setWbsHeaderId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("Initial");
  const [statusId, setStatusId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());

  // Determine title based on formType
  const title = formType === 'manpower' ? 'Manpower Form' : formType === 'odc' ? 'ODC Form' : 'Work Breakdown Structure';
  
  // Convert formType to TaskType
  const taskType = formType === 'manpower' ? TaskType.Manpower : TaskType.ODC;
  
  // Function to fetch the header status
  const fetchWBSHeaderStatus = async () => {
    if (!projectId) return;

    try {
      // Fetch the WBS header status using the API
      const headerStatus = await wbsHeaderApi.getWBSHeaderStatus(Number(projectId), taskType);

      
      if (headerStatus) {
        setWbsHeaderId(headerStatus.id);
       setStatusId(headerStatus.statusId);
        // Map status ID to status string
        const statusMap: { [key: number]: string } = {
          1: "Initial",
          2: "Sent for Review",
          3: "Review Changes",
          4: "Sent for Approval",
          5: "Approval Changes",
          6: "Approved"
        };

        const mappedStatus = statusMap[headerStatus.statusId] || "Initial";
        console.log("WBSHeader - Refreshed status:", mappedStatus, "ID:", headerStatus.id, "Status ID:", headerStatus.statusId);

        // Log the raw response for debugging
        console.log("WBSHeader - Raw status response:", headerStatus);

        setStatus(mappedStatus);
      }
    } catch (error) {
      console.error("Error fetching WBS header status:", error);
      throw error;
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      if (!projectId) return;

      setIsLoading(true);
      try {
        await fetchWBSHeaderStatus();
      } catch (error) {
        console.error("Error in initial fetch:", error);
        setStatus("Initial");
      } finally {
        setIsLoading(false);
      }
    };

    initialFetch();
  }, [projectId, formType, lastRefreshTime]);

  // Refresh the status when edit mode changes
  useEffect(() => {
    if (projectId) {
      // Set a small delay to ensure the backend has processed any changes
      const timer = setTimeout(() => {
        fetchWBSHeaderStatus();
        setLastRefreshTime(Date.now());
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [editMode, projectId]);

  // Handle status update from workflow component
  const handleStatusUpdate = async(newStatus: string) => {
    console.log("WBSHeader - Status updated to:", newStatus);
    setStatus(newStatus);
    await fetchWBSHeaderStatus();
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
