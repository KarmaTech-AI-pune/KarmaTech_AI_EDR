import { Project, ProjectStatus } from '../types';
import { 
  projects,
  getProjectById as findProjectById,
  getProjectsByStatus,
  calculateTotalProjectValue
} from './database/dummyProjects';

export const projectApi = {
  initializeProjects: async (): Promise<void> => {
    // No-op initialization, as dummyProjects already has the data
  },

  getAll: async (): Promise<Project[]> => {
    try {
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Project> => {
    try {
      const project = findProjectById(id);
      if (!project) {
        throw new Error(`Project with id ${id} not found`);
      }
      return project;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },

  create: async (project: Omit<Project, 'id'>): Promise<Project> => {
    try {
      const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id || 0)) + 1 : 1;
      
      const formattedProject: Project = {
        ...project,
        id: newId,
        startDate: project.startDate || undefined,
        endDate: project.endDate || undefined,
        estimatedCost: Number(project.estimatedCost),
        progress: Number(project.progress),
        status: project.status || ProjectStatus['Opportunity'],
        createdAt: new Date().toISOString(),
        createdBy: 'System'
      };

      projects.push(formattedProject);
      return formattedProject;
    } catch (error: any) {
      console.error('Project creation error:', {
        requestData: project,
        error: {
          message: error.message
        }
      });
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.title ||
        'Failed to create project'
      );
    }
  },

  update: async (id: number, project: Project): Promise<Project | null> => {
    try {
      const index = projects.findIndex(p => p.id === id);
      if (index === -1) return null;

      const formattedProject = {
        ...project,
        startDate: project.startDate ? new Date(project.startDate).toISOString() : undefined,
        endDate: project.endDate ? new Date(project.endDate).toISOString() : undefined,
        estimatedCost: Number(project.estimatedCost),
        progress: Number(project.progress),
        status: project.status as ProjectStatus
      };

      projects[index] = formattedProject;
      return formattedProject;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number): Promise<boolean> => {
    try {
      const initialLength = projects.length;
      const filteredProjects = projects.filter(p => p.id !== id);
      
      if (filteredProjects.length < initialLength) {
        projects.length = 0;
        projects.push(...filteredProjects);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }
};
