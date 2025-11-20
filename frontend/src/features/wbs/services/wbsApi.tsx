import { axiosInstance } from '../../../services/axiosConfig';
import { WBSRowData, WBSOption, TaskType } from '../types/wbs.ts'; // Corrected import path for WBSOption and TaskType
import { PlannedHour } from '../../../models/plannedHourModel';

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

        const isOdcTask = row.taskType === TaskType.ODC;

        // Transform the row data to match the new backend contract
        return {
          id: isTemporaryId ? 0 : parseInt(row.id), // Use 0 for new tasks, otherwise parse existing ID
          workBreakdownStructureId: 0, // Placeholder, will be set at a higher level if needed
          level: row.level,
          title: row.title, // Use row.title directly
          description: "", // Default empty description
          displayOrder: 0, // Placeholder
          estimatedBudget: 0, // Placeholder
          startDate: null, // Placeholder
          endDate: null, // Placeholder
          taskType: row.taskType !== undefined ? row.taskType : (row.title.toLowerCase().includes('odc') ? TaskType.ODC : TaskType.Manpower), // Use taskType if set, otherwise infer from title
          assignedUserId: isOdcTask ? null : row.assignedUserId, // Use assignedUserId from row
          assignedUserName: isOdcTask ? null : row.name, // Use row.name as assignedUserName
          costRate: row.costRate,
          resourceName: isOdcTask ? row.name : null, // Use row.name as resourceName for ODC tasks
          resourceUnit: isOdcTask ? (row.unit || "") : (row.unit || ""),
          resourceRoleId: row.resource_role, // Add ResourceRoleId to the payload
          resourceRoleName: row.resource_role_name || "", // Add ResourceRoleName to the payload
          plannedHours: monthlyHours.map(ph => ({ // Convert to lowercase keys
            year: ph.Year,
            month: ph.Month,
            plannedHours: ph.PlannedHours
          })),
          totalHours: row.totalHours,
          totalCost: row.totalCost,
          children: [], // Initialize as empty array as per new contract example
          wbsOptionId: row.wbsOptionId, // Add WBSOptionId to the payload
          wbsOptionLabel: row.title // Use row.title as wbsOptionLabel
        };
      };

      // Group tasks by their top-level parent (level 1 task) to form workBreakdownStructures
      const wbsStructuresMap = new Map<string, any>();

      wbsData.forEach(task => {
        let topLevelParentId: string | null = task.id;
        let currentTask = task;
        while (currentTask.parentId) {
          const parent = tempIdMap.get(currentTask.parentId);
          if (parent) {
            topLevelParentId = parent.id;
            currentTask = parent;
          } else {
            break; // Should not happen if data is consistent
          }
        }

        if (!wbsStructuresMap.has(topLevelParentId)) {
          wbsStructuresMap.set(topLevelParentId, {
            wbsHeaderId: 0, // Placeholder
            workBreakdownStructureId: 0, // Placeholder
            name: currentTask.title, // Use the title of the top-level parent as the name
            description: "", // Placeholder
            displayOrder: 0, // Placeholder
            tasks: []
          });
        }
        wbsStructuresMap.get(topLevelParentId).tasks.push(transformRowToBackendFormat(task));
      });

      const workBreakdownStructures = Array.from(wbsStructuresMap.values());

      const finalPayload = {
        wbsHeaderId: 0, // Placeholder, assuming 0 for new or existing header
        workBreakdownStructures: workBreakdownStructures.map((wbs, index) => ({
          ...wbs,
          displayOrder: index + 1 // Assign display order based on array index
        }))
      };

      console.log("Sending transformed WBS data:", JSON.stringify(finalPayload, null, 2));

      // Send all tasks to the backend in a single request
      await axiosInstance.put(`/api/projects/${projectId}/wbs`, finalPayload);
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

  getWBSOptions: async (): Promise<WBSOption[]> => {
    try {
      const response = await axiosInstance.get('/api/wbsoptions');
      return response.data;
    } catch (error) {
      throw error
    }
  },

  /**
   * Create a new WBS option
   * @param newOption The new option object
   * @returns Promise with created WBSOption
   */
  createOption: async (newOption: WBSOption): Promise<WBSOption> => {
    try {
      const response = await axiosInstance.post('/api/WBSOptions', newOption);
      return response.data;
    } catch (error) {
      console.error(`Error creating new WBS option:`, error);
      throw error;
    }
  },

  /**
   * Update an existing WBS option
   * @param id WBS option ID
   * @param updatedOption The updated option object
   * @returns Promise with updated WBSOption
   */
  updateOption: async (id: string, updatedOption: WBSOption): Promise<WBSOption> => {
    try {
      const response = await axiosInstance.put(`/api/WBSOptions/${id}`, updatedOption);
      return response.data;
    } catch (error) {
      console.error(`Error updating WBS option ${id}:`, error);
      throw error;
    }
  },
  
  deleteOption: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/WBSOptions/${id}`);
    } catch (error) {
      console.error(`Error deleting WBS option ${id}:`, error);
      throw error;
    }
  },

  
  
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
  },

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
