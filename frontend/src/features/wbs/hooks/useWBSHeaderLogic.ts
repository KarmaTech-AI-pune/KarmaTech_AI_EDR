import { useEffect, useState, useCallback } from 'react';
import { useProject } from '../../../context/ProjectContext';
import { TaskType, WBSVersion } from '../types/wbs';
import { wbsHeaderApi } from '../services/wbsHeaderApi';
import { wbsVersionApi } from '../services/wbsVersionApi';
import { useWBSDataContext, useWBSActionsContext } from '../context/WBSContext';

interface UseWBSHeaderLogicProps {
  formType: 'manpower' | 'odc';
}

export const useWBSHeaderLogic = (props: UseWBSHeaderLogicProps) => {
  const { formType } = props;
  const { projectId } = useProject();

  const { editMode, selectedVersion } = useWBSDataContext();
  const { addNewMonth, onEditModeToggle, reloadWBSData, setSelectedVersion } = useWBSActionsContext();

  const [wbsHeaderId, setWbsHeaderId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("Initial");
  const [statusId, setStatusId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());

  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState<boolean>(false);
  const [versions, setVersions] = useState<WBSVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState<boolean>(false);

  const activeVersion = versions.find(v => v.isActive);
  const baseTitle = formType === 'manpower' ? 'Manpower Form' : formType === 'odc' ? 'ODC Form' : 'Work Breakdown Structure';
  
  // Use selectedVersion for title if set, otherwise fallback to active version from list
  const displayVersion = selectedVersion || (activeVersion ? activeVersion.version : null);
  const title = displayVersion ? `${baseTitle} (Version ${displayVersion})` : baseTitle;
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

  const fetchVersions = useCallback(async () => {
    if (!projectId) return;
    setVersionsLoading(true);
    try {
      const data = await wbsVersionApi.getWBSVersions(projectId.toString());
      setVersions(data);
    } catch (error) {
      console.error("Error fetching WBS versions:", error);
    } finally {
      setVersionsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchWBSHeaderStatus();
    fetchVersions();
  }, [fetchWBSHeaderStatus, fetchVersions, lastRefreshTime]);

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
    await fetchVersions();
  }, [fetchWBSHeaderStatus, fetchVersions]);

  const handleOpenHistory = useCallback(() => {
    setIsHistoryDialogOpen(true);
    fetchVersions();
  }, [fetchVersions]);

  const handleCloseHistory = useCallback(() => {
    setIsHistoryDialogOpen(false);
  }, []);

  const handleActivateVersion = useCallback(async (version: string) => {
    if (!projectId) return;
    try {
      await wbsVersionApi.activateWBSVersion(projectId.toString(), version);
      
      // Set selected version to the activated version to switch to that specific data
      setSelectedVersion(version);
      reloadWBSData();
      
      await fetchWBSHeaderStatus();
      await fetchVersions();
    } catch (error) {
      console.error("Error activating version:", error);
    }
  }, [projectId, fetchWBSHeaderStatus, fetchVersions, reloadWBSData, setSelectedVersion]);

  const handleSelectVersion = useCallback((version: string) => {
    setSelectedVersion(version);
    handleCloseHistory();
  }, [setSelectedVersion, handleCloseHistory]);

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
    isUnderApproval: [2, 4, 6].includes(statusId) || ["Sent for Review", "Sent for Approval", "Approved" ].includes(status),
    isHistoryDialogOpen,
    versions,
    versionsLoading,
    handleOpenHistory,
    handleCloseHistory,
    handleActivateVersion,
    handleSelectVersion,
    isReadOnlyVersion: (() => {
      const currentVersionObj = versions.find(v => v.version === displayVersion);
      return currentVersionObj ? !currentVersionObj.isLatest : (versions.length > 0 && !!displayVersion);
    })()
  };
};