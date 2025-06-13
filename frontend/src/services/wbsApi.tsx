import { axiosInstance } from './axiosConfig';
import { WBSRowData, WBSOption, TaskType } from '../types/wbs';
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
      // Create a map of temporary IDs for quick lookup
      const tempIdMap = new Map(wbsData.map(row => [row.id, row]));

      // Helper function to convert WBSRowData to backend format
      const transformRowToBackendFormat = (row: WBSRowData) => {
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
          Title: row.title,
          AssignedUserId: isOdcTask ? null : row.name,
          ResourceName: isOdcTask ? row.name : null,
          CostRate: row.costRate,
          ResourceUnit: isOdcTask ? (row.unit || "") : (row.unit || ""),
          TotalHours: row.totalHours,
          TotalCost: row.totalCost,
          MonthlyHours: monthlyHours,
          TaskType: row.taskType !== undefined ? row.taskType : (row.title.toLowerCase().includes('odc') ? TaskType.ODC : TaskType.Manpower), // Use taskType if set, otherwise infer from title
          Description: "",
          DisplayOrder: 0,
          EstimatedBudget: 0,
          StartDate: null,
          EndDate: null,
          ResourceRole: row.resource_role // Add ResourceRole to the payload
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
   * @param formType Optional form type (0 = Manpower, 1 = ODC)
   * @returns Promise with WBS options
   */
  getAllOptions: async (formType?: number) => {
    try {
      const url = (formType === 0 || formType === 1)
        ? `/api/wbsoptions?formType=${formType}`
        : '/api/wbsoptions';

      console.log(`Calling API with URL: ${url}`);
      const response = await axiosInstance.get(url);
      console.log('WBS options API response:', response.data);

      return response.data;
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
   * @param formType Optional form type (0 = Manpower, 1 = ODC)
   * @returns Promise with level 1 options
   */
  getLevel1Options: async (formType?: number): Promise<WBSOption[]> => {
    try {
      const url = (formType === 0 || formType === 1)
        ? `/api/wbsoptions/level1?formType=${formType}`
        : '/api/wbsoptions/level1';

      console.log(`Calling API with URL: ${url}`);
      const response = await axiosInstance.get(url);
      console.log('WBS level 1 options API response:', response.data);

      return response.data;
    } catch (error) {
      console.warn('Using fallback data for level 1 WBS options due to API error:', error);
      return WBSOptionsAPI.fallbackData.level1;
    }
  },

  /**
   * Get level 2 WBS options
   * @param formType Optional form type (0 = Manpower, 1 = ODC)
   * @returns Promise with level 2 options
   */
  getLevel2Options: async (formType?: number): Promise<WBSOption[]> => {
    try {
      const url = (formType === 0 || formType === 1)
        ? `/api/wbsoptions/level2?formType=${formType}`
        : '/api/wbsoptions/level2';

      console.log(`Calling API with URL: ${url}`);
      const response = await axiosInstance.get(url);
      console.log('WBS level 2 options API response:', response.data);

      return response.data;
    } catch (error) {
      console.warn('Using fallback data for level 2 WBS options due to API error:', error);
      return WBSOptionsAPI.fallbackData.level2;
    }
  },

  /**
   * Get level 3 WBS options for a specific level 2 value
   * @param level2Value Level 2 value
   * @param formType Optional form type (0 = Manpower, 1 = ODC)
   * @returns Promise with level 3 options
   */
  getLevel3Options: async (level2Value: string, formType?: number): Promise<WBSOption[]> => {
    try {
      const url = (formType === 0 || formType === 1)
        ? `/api/wbsoptions/level3/${level2Value}?formType=${formType}`
        : `/api/wbsoptions/level3/${level2Value}`;

      console.log(`Calling API with URL: ${url}`);
      const response = await axiosInstance.get(url);
      console.log(`WBS level 3 options for ${level2Value} API response:`, response.data);

      return response.data;
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
