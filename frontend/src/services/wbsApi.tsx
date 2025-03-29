import { axiosInstance } from './axiosConfig';
import { WBSRowData, WBSOption } from '../types/wbs';
import { MonthlyHour } from '../models/monthlyHourModel';

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
      const sortedData = [...wbsData].sort((a, b) => a.level - b.level);
      
      // Helper function to convert WBSRowData to backend format
      const transformRowToBackendFormat = (row: WBSRowData, realParentId: number | null = null) => {
        // Convert monthly hours from object to array format
        const monthlyHours: Array<{Year: number, Month: string, PlannedHours: number}> = [];
        Object.entries(row.monthlyHours).forEach(([year, months]) => {
          Object.entries(months).forEach(([month, hours]) => {
            monthlyHours.push({
              Year: parseInt(year),
              Month: month,
              PlannedHours: hours
            });
          });
        });

        // Check if ID is a large number (likely a frontend-generated timestamp)
        const isTemporaryId = !row.id || row.id.length > 10; // Simple check for large IDs or empty IDs
        
        // Transform the row data to match WBSTaskDto
        return {
          Id: isTemporaryId ? 0 : parseInt(row.id) || 0, // Use 0 for new tasks with temporary IDs
          ParentId: realParentId, // Use the provided real parent ID
          Level: row.level,
          Title: row.title,
          AssignedUserId: row.name,
          CostRate: row.costRate,
          ODC: row.odc,
          TotalHours: row.totalHours,
          TotalCost: row.totalCost,
          MonthlyHours: monthlyHours,
          // Add any missing required fields with default values
          Description: "",
          DisplayOrder: 0,
          EstimatedBudget: 0,
          StartDate: null,
          EndDate: null
        };
      };

      // Group tasks by level
      const level1Tasks = sortedData.filter(row => row.level === 1);
      const level2Tasks = sortedData.filter(row => row.level === 2);
      const level3Tasks = sortedData.filter(row => row.level === 3);
      
      // Process all tasks in a single request, but ensure proper parent-child relationships
      const transformedData = [];
      
      // Process level 1 tasks first (these have no parents)
      for (const task of level1Tasks) {
        transformedData.push(transformRowToBackendFormat(task, null));
      }
      
      // Process level 2 tasks - all level 2 tasks will have the first level 1 task as parent
      if (level1Tasks.length > 0) {
        // For level 2 tasks, we'll set all their ParentId to null
        // The backend will handle the parent-child relationship based on the task level
        for (const task of level2Tasks) {
          transformedData.push(transformRowToBackendFormat(task, null));
        }
      }
      
      // Process level 3 tasks - all level 3 tasks will have the first level 2 task as parent
      if (level2Tasks.length > 0) {
        // For level 3 tasks, we'll set all their ParentId to null
        // The backend will handle the parent-child relationship based on the task level
        for (const task of level3Tasks) {
          transformedData.push(transformRowToBackendFormat(task, null));
        }
      }

      console.log("Sending transformed WBS data:", JSON.stringify(transformedData, null, 2));
      
      // Send all tasks to the backend in a single request
      await axiosInstance.put(`/api/projects/${projectId}/wbs`, transformedData);
    } catch (error) {
      console.error(`Error saving WBS for project ${projectId}:`, error);
      throw error;
    }
  }
};

export const WBSOptionsAPI = {
  // Fallback data for when API calls fail
  fallbackData: {
    level1: [
      { value: 'inception_report', label: 'Inception Report' },
      { value: 'feasibility_report', label: 'Feasibility Report' },
      { value: 'draft_detailed_project_report', label: 'Draft Detailed Project Report' },
      { value: 'detailed_project_report', label: 'Detailed Project Report' },
      { value: 'tendering_documents', label: 'Construction Supervision' }
    ],
    level2: [
      { value: 'surveys', label: 'Surveys' },
      { value: 'design', label: 'Design' },
      { value: 'cost_estimation', label: 'Cost Estimation' }
    ],
    level3: {
      'surveys': [
        { value: 'topographical_survey', label: 'Topographical Survey' },
        { value: 'soil_investigation', label: 'Soil Investigation' },
        { value: 'social_impact_assessment', label: 'Social Impact Assessment' },
        { value: 'environmental_assessment', label: 'Environmental Assessment' },
        { value: 'flow_measurement', label: 'Flow Measurement' },
        { value: 'water_quality_measurement', label: 'Water Quality Measurement' }
      ],
      'design': [
        { value: 'process_design', label: 'Process Design' },
        { value: 'mechanical_design', label: 'Mechanical Design' },
        { value: 'structural_design', label: 'Structural Design' },
        { value: 'electrical_design', label: 'Electrical Design' },
        { value: 'ica_design', label: 'ICA Design' }
      ],
      'cost_estimation': [
        { value: 'cost_estimation', label: 'Cost Estimation' }
      ]
    } as { [key: string]: WBSOption[] }
  },

  /**
   * Get all WBS options for all levels
   * @returns Promise with WBS options
   */
  getAllOptions: async () => {
    try {
      // const response = await axiosInstance.get('/api/wbsoptions');
      // return response.data;

      return {
        level1: WBSOptionsAPI.fallbackData.level1,
        level2: WBSOptionsAPI.fallbackData.level2,
        level3: WBSOptionsAPI.fallbackData.level3
      };

    } catch (error) {
      console.warn('Using fallback data for WBS options due to API error:', error);
      return {
        level1: WBSOptionsAPI.fallbackData.level1,
        level2: WBSOptionsAPI.fallbackData.level2,
        level3: WBSOptionsAPI.fallbackData.level3
      };
    }
  },

  /**
   * Get level 1 WBS options
   * @returns Promise with level 1 options
   */
  getLevel1Options: async (): Promise<WBSOption[]> => {
    try {
      // const response = await axiosInstance.get('/api/wbsoptions/level1');
      // return response.data;
      return WBSOptionsAPI.fallbackData.level1;
    } catch (error) {
      console.warn('Using fallback data for level 1 WBS options due to API error:', error);
      return WBSOptionsAPI.fallbackData.level1;
    }
  },

  /**
   * Get level 2 WBS options
   * @returns Promise with level 2 options
   */
  getLevel2Options: async (): Promise<WBSOption[]> => {
    try {
      // const response = await axiosInstance.get('/api/wbsoptions/level2');
      // return response.data;
      return WBSOptionsAPI.fallbackData.level2;
    } catch (error) {
      console.warn('Using fallback data for level 2 WBS options due to API error:', error);
      return WBSOptionsAPI.fallbackData.level2;
    }
  },

  /**
   * Get level 3 WBS options for a specific level 2 value
   * @param level2Value Level 2 value
   * @returns Promise with level 3 options
   */
  getLevel3Options: async (level2Value: string): Promise<WBSOption[]> => {
    try {
      // const response = await axiosInstance.get(`/api/wbsoptions/level3/${level2Value}`);
      // return response.data;
      return WBSOptionsAPI.fallbackData.level3[level2Value] || [];
    } catch (error) {
      console.warn(`Using fallback data for level 3 WBS options for ${level2Value} due to API error:`, error);
      return WBSOptionsAPI.fallbackData.level3[level2Value] || [];
    }
  }
};

export const MonthlyHoursAPI = {
  /**
   * Get monthly hours for a project
   * @param projectId Project ID
   * @returns Promise with monthly hours data
   */
  getMonthlyHoursByProjectId: async (projectId: string) => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/monthlyhours`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching monthly hours for project ${projectId}:`, error);
      throw new Error(`Failed to load monthly hours for project ${projectId}. Please check if the backend service is running.`);
    }
  },

  /**
   * Update monthly hours for a task
   * @param projectId Project ID
   * @param taskId Task ID
   * @param data Monthly hours data
   * @returns Promise with updated data
   */
  updateMonthlyHours: async (projectId: string, taskId: string, data: { monthly_hours: Partial<MonthlyHour>[] }) => {
    try {
      const response = await axiosInstance.put(
        `/api/projects/${projectId}/wbs/tasks/${taskId}/monthlyhours`, 
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating monthly hours for task ${taskId}:`, error);
      // For update operations, we still throw the error as we can't provide a meaningful fallback
      throw error;
    }
  }
};
