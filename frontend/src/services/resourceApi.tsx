import { axiosInstance } from './axiosConfig';
import { resourceRole, Employee } from '../models';
import { FallbackDataProvider } from './fallbackData';

export const ResourceAPI = {
  /**
   * Get all resource roles
   * @returns Promise with array of resource roles
   */
  getAllRoles: async (): Promise<resourceRole[]> => {
    try {
      const response = await axiosInstance.get('/api/resources/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching resource roles:', error);
      // Fallback to dummy data
      return FallbackDataProvider.getResourceRoles();
    }
  },

  /**
   * Get all employees that can be assigned to tasks
   * @returns Promise with array of employees
   */
  getAllEmployees: async (): Promise<Employee[]> => {
    try {
      const response = await axiosInstance.get('/api/resources/employees');
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Fallback to dummy data
      return FallbackDataProvider.getEmployees();
    }
  },

  /**
   * Get employee by ID
   * @param id Employee ID
   * @returns Promise with employee data
   */
  getEmployeeById: async (id: string): Promise<Employee | undefined> => {
    try {
      const response = await axiosInstance.get(`/api/resources/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee with ID ${id}:`, error);
      // Fallback to dummy data
      return FallbackDataProvider.getEmployeeById(id);
    }
  }
};
