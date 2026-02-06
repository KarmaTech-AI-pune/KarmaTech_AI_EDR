import { useContext, useEffect, useState, useCallback } from 'react';
import { projectManagementAppContext } from '../../../App';
import { TaskType } from '../types/wbs';
import { wbsHeaderApi } from '../services/wbsHeaderApi';
import { useWBSDataContext, useWBSActionsContext } from '../context/WBSContext';

interface UseWBSHeaderLogicProps {
  formType: 'manpower' | 'odc';
}

export const useWBSHeaderLogic = (props: UseWBSHeaderLogicProps) => {
  const { formType } = props;
  const context = useContext(projectManagementAppContext);
  const projectId = context?.selectedProject?.id;

  const { editMode } = useWBSDataContext();
  const { addNewMonth, onEditModeToggle } = useWBSActionsContext();

  const [wbsHeaderId, setWbsHeaderId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("Initial");
  const [statusId, setStatusId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());

  const title = formType === 'manpower' ? 'Manpower Form' : formType === 'odc' ? 'ODC Form' : 'Work Breakdown Structure';
  const taskType = formType === 'manpower' ? TaskType.Manpower : TaskType.ODC;

  const fetchWBSHeaderStatus = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const headerStatus = await wbsHeaderApi.getWBSHeaderStatus(Number(projectId), taskType);

      if (headerStatus) {
        setWbsHeaderId(headerStatus.id);
        setStatusId(headerStatus.statusId);
        const statusMap: { [key: number]: string } = {
          1: "Initial",
          2: "Sent for Review",
          3: "Review Changes",
          4: "Sent for Approval",
          5: "Approval Changes",
          6: "Approved"
        };
        const mappedStatus = statusMap[headerStatus.statusId] || "Initial";
        setStatus(mappedStatus);
      }
    } catch (error) {
      console.error("Error fetching WBS header status:", error);
      setStatus("Initial");
      setWbsHeaderId(null);
      setStatusId(0);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, taskType]);

  useEffect(() => {
    fetchWBSHeaderStatus();
  }, [fetchWBSHeaderStatus, lastRefreshTime]);

  useEffect(() => {
    if (projectId) {
      const timer = setTimeout(() => {
        setLastRefreshTime(Date.now());
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [editMode, projectId]);

  const handleStatusUpdate = useCallback(async (newStatus: string) => {
    setStatus(newStatus);
    await fetchWBSHeaderStatus();
  }, [fetchWBSHeaderStatus]);

  return {
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
    isUnderApproval: [2, 4].includes(statusId) || ["Sent for Review", "Sent for Approval" ].includes(status),
    selectedProject: context?.selectedProject,
    currentUser: context?.currentUser
  };
};
