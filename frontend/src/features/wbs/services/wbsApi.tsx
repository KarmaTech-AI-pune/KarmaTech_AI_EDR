import { axiosInstance } from '../../../services/axiosConfig';
import { WBSRowData, WBSOption, TaskType } from '../types/wbs.ts'; // Corrected import path for WBSOption and TaskType
import { PlannedHour } from '../../../models/plannedHourModel';

export const WBSStructureAPI = {
  /**
   * Get WBS structure for a project
   * @param projectId Project ID
   * @returns Promise with WBS data including header ID and tasks
   */
  getProjectWBS: async (projectId: string): Promise<{ wbsHeaderId: number; tasks: WBSRowData[]; workBreakdownStructures: any[] }> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/wbs`);
      const flattenedTasks: WBSRowData[] = [];
      const wbsHeaderId = response.data.wbsHeaderId || 0;
      const workBreakdownStructures = response.data.workBreakdownStructures || [];

      if (workBreakdownStructures && Array.isArray(workBreakdownStructures)) {
        workBreakdownStructures.forEach((wbsItem: any) => {
          if (wbsItem.tasks && Array.isArray(wbsItem.tasks)) {
            // Attach workBreakdownStructureId to each task for later reference
            const tasksWithWbsId = wbsItem.tasks.map((task: any) => ({
              ...task,
              workBreakdownStructureId: wbsItem.workBreakdownStructureId || 0
            }));
            flattenedTasks.push(...tasksWithWbsId);
          }
        });
      }
      return { wbsHeaderId, tasks: flattenedTasks, workBreakdownStructures };
    } catch (error) {
      console.error(`Error fetching WBS for project ${projectId}:`, error);
      throw new Error(`Failed to load WBS data for project ${projectId}. Please check if the backend service is running.`);
    }
  },

  /**
   * Save WBS structure for a project
   * @param projectId Project ID
   * @param wbsData WBS data to save
   * @param wbsHeaderId Current WBS header ID (0 for new, or existing ID)
   * @returns Promise
   */
  setProjectWBS: async (projectId: string, wbsData: WBSRowData[], wbsHeaderId: number = 0): Promise<void> => {
    try {
      // Create a map of temporary IDs for quick lookup
      const tempIdMap = new Map(wbsData.map(row => [row.id, row]));

      // Helper function to convert WBSRowData to backend format
      const transformRowToBackendFormat = (row: WBSRowData) => {
        // Convert monthly hours from object to array format
        const monthlyHours: Array<{ Year: number, Month: string, PlannedHours: number }> = [];
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

        // Handle parentId - convert to proper format for backend
        let parentIdValue: number | null = null;
        if (row.parentId) {
          // Check if parentId is a real numeric ID
          const parsedParentId = parseInt(row.parentId);
          if (!isNaN(parsedParentId) && row.parentId.length <= 10) {
            // Real ID - use it
            parentIdValue = parsedParentId;
          } else {
            // Temporary ID - set to null for new tasks
            parentIdValue = null;
          }
        }

        // Transform the row data to match the new backend contract
        return {
          id: isTemporaryId ? 0 : parseInt(row.id), // Use 0 for new tasks, otherwise parse existing ID
          workBreakdownStructureId: (row as any).workBreakdownStructureId || 0, // Preserve existing ID or use 0 for new
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
          wbsOptionLabel: row.title, // Use row.title as wbsOptionLabel
          parentId: parentIdValue // Use properly formatted parentId
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
            workBreakdownStructureId: 0, // Will be determined after grouping all tasks
            name: currentTask.title, // Use the title of the top-level parent as the name
            description: "", // Placeholder
            displayOrder: 0, // Placeholder
            tasks: []
          });
        }
        wbsStructuresMap.get(topLevelParentId).tasks.push(transformRowToBackendFormat(task));
      });

      // After grouping, determine workBreakdownStructureId for each group
      wbsStructuresMap.forEach((wbsGroup) => {
        // Check if any task in this group has a real workBreakdownStructureId
        let existingWbsId = 0;
        for (const task of wbsGroup.tasks) {
          if (task.workBreakdownStructureId && task.workBreakdownStructureId > 0) {
            existingWbsId = task.workBreakdownStructureId;
            break;
          }
        }
        wbsGroup.workBreakdownStructureId = existingWbsId;
      });

      const workBreakdownStructures = Array.from(wbsStructuresMap.values());

      const finalPayload = {
        wbsHeaderId: wbsHeaderId, // Use provided wbsHeaderId
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
      await axiosInstance.delete(`/api/projects/${projectId}/WBS/tasks?wbsTaskId=${taskId}`);
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
      // Transform to backend DTO format
      const payload = [{
        Id: parseInt(newOption.id) || 0,
        Value: newOption.value,
        Label: newOption.label,
        Level: newOption.level || 1,
        ParentId: newOption.parentValue ? parseInt(newOption.parentValue) : null, // Convert parentValue to ParentId (integer)
        FormType: newOption.formType || 0
      }];

      console.log('Create WBS Option payload:', payload);

      const response = await axiosInstance.post('/api/WBSOptions', payload);
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
      // Convert string ID to number for backend
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error(`Invalid ID format: ${id}`);
      }

      // Format payload to match backend WBSOptionDto exactly
      const payload = {
        Id: numericId,
        Value: updatedOption.value,
        Label: updatedOption.label,
        Level: updatedOption.level || 1,
        ParentId: updatedOption.parentValue ? parseInt(updatedOption.parentValue) : null, // Convert parentValue to ParentId (integer)
        FormType: updatedOption.formType || 0
      };

      console.log('Update WBS Option payload:', payload);

      const response = await axiosInstance.put(`/api/WBSOptions/${numericId}`, payload);
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
   * @param level1Id The ID of the level 1 option
   * @param formType Optional form type (0 = Manpower, 1 = ODC)
   * @returns Promise with level 2 options
   */
  getLevel2Options: async (level1Id: string, formType?: number): Promise<WBSOption[]> => {
    let url = `/api/WBSOptions/level2?level1Id=${level1Id}`;
    if (formType === 0 || formType === 1) {
      url += `&formType=${formType}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Get level 3 WBS options for a specific level 2 option
   * @param level2Id The ID of the level 2 option
   * @param formType Optional form type (0 = Manpower, 1 = ODC)
   * @returns Promise with level 3 options
   */
  getLevel3Options: async (level2Id: string, formType?: number): Promise<WBSOption[]> => {
    let url = `/api/WBSOptions/level3?level2Id=${level2Id}`;
    if (formType === 0 || formType === 1) {
      url += `&formType=${formType}`;
    }
    const response = await axiosInstance.get(url);
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
