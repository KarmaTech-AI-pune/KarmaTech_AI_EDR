import { resourceRoles, employees } from '../dummyapi/database/dummyResourceRoles';
import { wbsTasks, resourceAllocations, monthlyHours, getWBSOptions, getLevel1Options, getLevel2Options, getLevel3Options } from '../dummyapi/database/dummyWBSTasks';
import { WBSRowData } from '../types/wbs';
import { resourceRole, Employee } from '../models';

/**
 * Fallback data provider for when the backend API is not available
 * This allows the application to continue working with dummy data during development
 */
export const FallbackDataProvider = {
  /**
   * Get resource roles
   * @returns Array of resource roles
   */
  getResourceRoles: (): resourceRole[] => {
    console.warn('Using fallback data for resource roles');
    return resourceRoles;
  },

  /**
   * Get employees
   * @returns Array of employees
   */
  getEmployees: (): Employee[] => {
    console.warn('Using fallback data for employees');
    return employees;
  },

  /**
   * Get employee by ID
   * @param id Employee ID
   * @returns Employee or undefined
   */
  getEmployeeById: (id: string): Employee | undefined => {
    console.warn(`Using fallback data for employee with ID ${id}`);
    return employees.find(emp => emp.id === id);
  },

  /**
   * Get WBS structure for a project
   * @param projectId Project ID
   * @returns Array of WBS row data
   */
  getProjectWBS: (projectId: string): WBSRowData[] => {
    console.warn(`Using fallback data for WBS of project ${projectId}`);
    
    // Filter tasks by project ID
    const projectTasks = wbsTasks.filter(task => task.project_id === projectId);
    
    // Transform tasks to WBSRowData
    return projectTasks.map(task => {
      const allocation = resourceAllocations.find(alloc => alloc.wbs_task_id === task.id);
      const taskHours = monthlyHours.filter(hour => hour.task_id === task.id);
      
      // Transform monthly hours into nested object structure
      const monthlyHoursObj: { [year: string]: { [month: string]: number } } = {};
      taskHours.forEach(hour => {
        if (!monthlyHoursObj[hour.year]) {
          monthlyHoursObj[hour.year] = {};
        }
        monthlyHoursObj[hour.year][hour.month] = hour.planned_hours;
      });
      
      return {
        id: task.id,
        level: task.level as 1 | 2 | 3,
        title: task.title,
        role: allocation?.role_id || null,
        name: allocation?.employee_id || null,
        costRate: allocation?.cost_rate || 0,
        monthlyHours: monthlyHoursObj,
        odc: allocation?.odc || 0,
        totalHours: allocation?.total_hours || 0,
        totalCost: allocation?.total_cost || 0,
        parentId: task.parent_id
      };
    });
  },

  /**
   * Get all WBS options
   * @returns WBS options
   */
  getAllWBSOptions: () => {
    console.warn('Using fallback data for WBS options');
    return getWBSOptions();
  },

  /**
   * Get level 1 WBS options
   * @returns Level 1 options
   */
  getLevel1Options: () => {
    console.warn('Using fallback data for level 1 WBS options');
    return getLevel1Options();
  },

  /**
   * Get level 2 WBS options
   * @returns Level 2 options
   */
  getLevel2Options: () => {
    console.warn('Using fallback data for level 2 WBS options');
    return getLevel2Options();
  },

  /**
   * Get level 3 WBS options for a specific level 2 value
   * @param level2Value Level 2 value
   * @returns Level 3 options
   */
  getLevel3Options: (level2Value: string) => {
    console.warn(`Using fallback data for level 3 WBS options for ${level2Value}`);
    return getLevel3Options(level2Value);
  },

  /**
   * Get monthly hours for a project
   * @param projectId Project ID
   * @returns Monthly hours data
   */
  getMonthlyHoursByProjectId: (projectId: string) => {
    console.warn(`Using fallback data for monthly hours of project ${projectId}`);
    
    // Filter tasks by project ID
    const projectTasks = wbsTasks.filter(task => task.project_id === projectId);
    const taskIds = projectTasks.map(task => task.id);
    
    // Filter monthly hours by task IDs
    return monthlyHours.filter(hour => taskIds.includes(hour.task_id));
  }
};
