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

const JobStartFormHeader: React.FC<JobStartFormHeaderProps> = ({
  title,
  projectId,
  formId,
  status = 'Initial',
  onStatusUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(status);
  const [headerLoaded, setHeaderLoaded] = useState<boolean>(false);

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
        setHeaderLoaded(true);
        // Update parent component with the current status
        onStatusUpdate(headerStatus.status);
      } catch (error) {
        console.error('Error fetching JobStartForm header status:', error);
        // If we can't fetch the status, use the provided status
        setCurrentStatus(status);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeaderStatus();
  }, [projectId, formId, status]);

  const handleStatusUpdate = (newStatus: string) => {
    setCurrentStatus(newStatus);
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
          {!isLoading && headerLoaded && (
            <Typography
              variant="body2"
              sx={{
                ml: 2,
                backgroundColor: currentStatus === 'Approved' ? '#e6f7e6' : '#f5f5f5',
                color: currentStatus === 'Approved' ? '#2e7d32' :
                       currentStatus.includes('Changes') ? '#d32f2f' : '#1976d2',
                fontWeight: 500,
                px: 1.5,
                py: 0.5,
                borderRadius: 1
              }}
            >
              {currentStatus}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isLoading && formId && projectId && (
            <ProjectTrackingWorkflow
              projectId={projectId.toString()}
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
