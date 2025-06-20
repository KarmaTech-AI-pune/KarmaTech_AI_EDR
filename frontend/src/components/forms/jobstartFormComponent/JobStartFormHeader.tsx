import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  styled,
  CircularProgress
} from '@mui/material';
import { ProjectTrackingWorkflow } from '../../common/ProjectTrackingWorkflow';
import { TaskType } from '../../../types/wbs';
import { jobStartFormHeaderApi } from '../../../services/jobStartFormHeaderApi';

const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  '& .MuiButton-root': {
    marginLeft: 'auto'
  }
}));

interface JobStartFormHeaderProps {
  title: string;
  projectId: number | string | undefined;
  formId: number | string | undefined;
  status?: string;
  editMode: boolean;
  onEditModeToggle: () => void;
  onStatusUpdate: (newStatus: string) => void;
}

// Helper function to map status string to statusId
const getStatusId = (status: string): number => {
  const statusMap: Record<string, number> = {
    'Initial': 1,
    'Sent for Review': 2,
    'Review Changes': 3,
    'Sent for Approval': 4,
    'Approval Changes': 5,
    'Approved': 6
  };
  
  // Normalize status string and find match
  const normalizedStatus = status?.trim() || 'Initial';
  return statusMap[normalizedStatus] || 1; // Default to 1 (Initial) if not found
};

const JobStartFormHeader: React.FC<JobStartFormHeaderProps> = ({
  title,
  projectId,
  formId,
  status = 'Initial',
  onStatusUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(status);
  const [currentStatusId, setCurrentStatusId] = useState<number>(getStatusId(status));

  // Fetch the current status when the component mounts or when formId changes
  useEffect(() => {
    const fetchHeaderStatus = async () => {
      if (!projectId || !formId) {
        return;
      }

      setIsLoading(true);
      try {
        const headerStatus = await jobStartFormHeaderApi.getJobStartFormHeaderStatus(projectId, formId);
        setCurrentStatus(headerStatus.status);
        
        // Set statusId - either from API response or map from status string
        const statusId = headerStatus.statusId || getStatusId(headerStatus.status);
        setCurrentStatusId(statusId);
        
        // Update parent component with the current status
        onStatusUpdate(headerStatus.status);
      } catch (error) {
        console.error('Error fetching JobStartForm header status:', error);
        // If we can't fetch the status, use the provided status
        setCurrentStatus(status);
        setCurrentStatusId(getStatusId(status));
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeaderStatus();
  }, [projectId, formId, status]);

  const handleStatusUpdate = (newStatus: string) => {
    setCurrentStatus(newStatus);
    setCurrentStatusId(getStatusId(newStatus));
    onStatusUpdate(newStatus);
  };

  return (
    <>
      <StyledHeaderBox>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          {isLoading && (
            <CircularProgress size={20} sx={{ ml: 2 }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isLoading && formId && projectId && (
            <ProjectTrackingWorkflow
              projectId={projectId.toString()}
              statusId={currentStatusId}
              status={currentStatus}
              entityId={Number(formId)}
              entityType="JobStartForm"
              formType={TaskType.Manpower}
              onStatusUpdate={handleStatusUpdate} statusId={0}            />
          )}
        </Box>
      </StyledHeaderBox>
    </>
  );
};

export default JobStartFormHeader;