import { axiosInstance } from './axiosConfig';
import { WBSRowData, WBSOption, TaskType } from '../types/wbs';
import { PlannedHour } from '../models/plannedHourModel';

export const WBSStructureAPI = {
  /**
   * Get WBS structure for a project
   * @param projectId Project ID
   * @returns Promise with array of WBS row data
   */
  getProjectWBS: async (projectId: string): Promise<WBSRowData[]> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/wbs`);
      return response.data.tasks || [];
    } catch (error) {
      console.error(`Error fetching WBS for project ${projectId}:`, error);
      throw new Error(`Failed to load WBS data for project ${projectId}. Please check if the backend service is running.`);
    }
  },

  /**
   * Save WBS structure for a project
   * @param projectId Project ID
   * @param wbsData WBS data to save
   * @returns Promise
   */
  setProjectWBS: async (projectId: string, wbsData: WBSRowData[]): Promise<void> => {
    try {
      // Sort the data by level to ensure we process parent items first
      // Create a map of temporary IDs for quick lookup
      const tempIdMap = new Map(wbsData.map(row => [row.id, row]));

      // Helper function to convert WBSRowData to backend format
      const transformRowToBackendFormat = (row: WBSRowData) => {
        // Convert monthly hours from object to array format
        const monthlyHours: Array<{Year: number, Month: string, PlannedHours: number}> = [];
        Object.entries(row.plannedHours || {}).forEach(([year, months]) => {
          Object.entries(months).forEach(([month, hours]) => {
            monthlyHours.push({
              Year: parseInt(year),
              Month: month,
              PlannedHours: hours
            });
          });
        });

        // Check if the current row's ID is temporary
        const isTemporaryId = !row.id || isNaN(parseInt(row.id)) || row.id.length > 10; // More robust check

        let realParentId: number | null = null;
        let parentFrontendTempId: string | null = null;

        if (row.parentId) {
          const parentRow = tempIdMap.get(row.parentId);
          if (parentRow) {
            // Check if the parent's ID is also temporary
            const isParentTemporaryId = !parentRow.id || isNaN(parseInt(parentRow.id)) || parentRow.id.length > 10;
            if (isParentTemporaryId) {
              // Parent is new, send its temporary ID
              parentFrontendTempId = row.parentId;
              realParentId = null; // Set real ParentId to null
            } else {
              // Parent exists, send its real ID
              realParentId = parseInt(row.parentId);
              parentFrontendTempId = null;
            }
          } else {
             // Parent ID exists but not found in current data (should ideally not happen if data is consistent)
             // Attempt to parse it as a real ID, otherwise nullify
             realParentId = !isNaN(parseInt(row.parentId)) ? parseInt(row.parentId) : null;
             parentFrontendTempId = null;
          }
        }

        
        const isOdcTask = row.taskType === TaskType.ODC;

        // Transform the row data to match WBSTaskDto
        return {
          Id: isTemporaryId ? 0 : parseInt(row.id), // Use 0 for new tasks
          FrontendTempId: isTemporaryId ? row.id : null, // Send temp ID if new
          ParentId: realParentId,
          ParentFrontendTempId: parentFrontendTempId,
          Level: row.level,
          Title: null,
          AssignedUserId: isOdcTask ? null : row.name,
          ResourceName: isOdcTask ? row.name : null,
          CostRate: row.costRate,
          ResourceUnit: isOdcTask ? (row.unit || "") : (row.unit || ""),
          TotalHours: row.totalHours,
          TotalCost: row.totalCost,
          PlannedHours: monthlyHours,
          TaskType: row.taskType !== undefined ? row.taskType : (row.title.toLowerCase().includes('odc') ? TaskType.ODC : TaskType.Manpower), // Use taskType if set, otherwise infer from title
          Description: "",
          DisplayOrder: 0,
          EstimatedBudget: 0,
          StartDate: null,
          EndDate: null,
          ResourceRoleId: row.resource_role, // Add ResourceRoleId to the payload
          WBSOptionId: row.wbsOptionId // Add WBSOptionId to the payload
        };
      };

      // Process all tasks using the updated transform function
      const transformedData = wbsData.map(task => transformRowToBackendFormat(task));

      console.log("Sending transformed WBS data:", JSON.stringify(transformedData, null, 2));

      // Send all tasks to the backend in a single request
      await axiosInstance.put(`/api/projects/${projectId}/wbs`, transformedData);
    } catch (error) {
      console.error(`Error saving WBS for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a WBS task
   * @param projectId Project ID
   * @param taskId Task ID
   * @returns Promise
   */
  deleteWBSTask: async (projectId: string, taskId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/projects/${projectId}/wbs/tasks/${taskId}`);
    } catch (error) {
      console.error(`Error deleting WBS task ${taskId} for project ${projectId}:`, error);
      throw error;
    }
  }
};

export const WBSOptionsAPI = {
  /**
   * Get level 1 WBS options
   * @param formType Optional form type (0 = Manpower, 1 = ODC)
   * @returns Promise with level 1 options
   */
  getLevel1Options: async (formType?: number): Promise<WBSOption[]> => {
    const url = (formType === 0 || formType === 1)
      ? `/api/wbsoptions/level1?formType=${formType}`
      : '/api/wbsoptions/level1';

    console.log(`Calling API with URL: ${url}`);
    const response = await axiosInstance.get(url);
    console.log('WBS level 1 options API response:', response.data);

    return response.data;
  },

  /**
   * Get level 2 WBS options
   * @param formType Optional form type (0 = Manpower, 1 = ODC)
   * @returns Promise with level 2 options
   */
  getLevel2Options: async (formType?: number): Promise<WBSOption[]> => {
    const url = (formType === 0 || formType === 1)
      ? `/api/wbsoptions/level2?formType=${formType}`
      : '/api/wbsoptions/level2';

    console.log(`Calling API with URL: ${url}`);
    const response = await axiosInstance.get(url);
    console.log('WBS level 2 options API response:', response.data);

    return response.data;
  },

  /**
   * Get level 3 WBS options for a specific level 2 value
   * @param level2Value Level 2 value
   * @param formType Optional form type (0 = Manpower, 1 = ODC)
   * @returns Promise with level 3 options
   */
  getLevel3Options: async (level2Value: string, formType?: number): Promise<WBSOption[]> => {
    const url = (formType === 0 || formType === 1)
      ? `/api/wbsoptions/level3/${level2Value}?formType=${formType}`
      : `/api/wbsoptions/level3/${level2Value}`;

    console.log(`Calling API with URL: ${url}`);
    const response = await axiosInstance.get(url);
    console.log(`WBS level 3 options for ${level2Value} API response:`, response.data);

    return response.data;
  }
};

export const PlannedHoursAPI = {
  /**
   * Get planned hours for a project
   * @param projectId Project ID
   * @returns Promise with planned hours data
   */
  getPlannedHoursByProjectId: async (projectId: string) => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/plannedhours`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching planned hours for project ${projectId}:`, error);
      throw new Error(`Failed to load planned hours for project ${projectId}. Please check if the backend service is running.`);
    }
  },

  /**
   * Update planned hours for a task
   * @param projectId Project ID
   * @param taskId Task ID
   * @param data Planned hours data
   * @returns Promise with updated data
   */
  updatePlannedHours: async (projectId: string, taskId: string, data: { planned_hours: Partial<PlannedHour>[] }) => {
    try {
      const response = await axiosInstance.put(
        `/api/projects/${projectId}/wbs/tasks/${taskId}/plannedhours`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating planned hours for task ${taskId}:`, error);
      throw error;
    }
  }
};
