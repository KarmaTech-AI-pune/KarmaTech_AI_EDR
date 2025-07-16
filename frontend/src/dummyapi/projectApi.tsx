import { Project } from '../models';
import { 
  projects,
  getProjectById as findProjectById,
} from './database/dummyProjects';

const validateRequiredFields = (project: Omit<Project, 'id'>) => {
  const requiredFields = [
    { field: 'name', label: 'Project Name' },
    { field: 'clientName', label: 'Client Name' },
    { field: 'projectManagerId', label: 'Project Manager' },
    { field: 'projectNo', label: 'Project Number' },
    { field: 'seniorProjectManagerId', label: 'Senior Project Manager' },
    { field: 'estimatedCost', label: 'Estimated Cost' },
    { field: 'currency', label: 'Currency' },
    { field: 'regionalManagerId', label: 'Regional Manager' }
  ];

  const missingFields = requiredFields.filter(({ field }) => {
    const value = project[field as keyof typeof project];
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    throw new Error(`Required fields missing: ${missingFields.map(f => f.label).join(', ')}`);
  }
};

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

  getById: async (id: string): Promise<Project> => {
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
      // Validate required fields
      validateRequiredFields(project);

      // Generate new ID as string
      const maxId = projects.length > 0 
        ? Math.max(...projects.map(p => parseInt(p.id))) 
        : 0;
      const newId = (maxId + 1).toString();
      
      const formattedProject: Project = {
        ...project,
        id: newId,
        startDate: project.startDate || undefined,
        endDate: project.endDate || undefined,
        estimatedProjectCost: Number(project.estimatedProjectCost),
        projectManagerId: String(project.projectManagerId),
        seniorProjectManagerId: String(project.seniorProjectManagerId),
        regionalManagerId: String(project.regionalManagerId)
      };

      projects.push(formattedProject);
      return formattedProject;
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Project creation error:', {
        requestData: project,
        error: {
          message: error.message
        }
      });
      throw new Error(
        error.message || 
        error.response?.data?.message || 
        error.response?.data?.title ||
        'Failed to create project'
      );
    }
  },

  update: async (id: string, project: Project): Promise<Project | null> => {
    try {
      // Validate required fields
      validateRequiredFields(project);

      const index = projects.findIndex(p => p.id === id);
      if (index === -1) return null;

      const formattedProject = {
        ...project,
        startDate: project.startDate ? new Date(project.startDate).toISOString() : undefined,
        endDate: project.endDate ? new Date(project.endDate).toISOString() : undefined,
        estimatedCost:  Number(project.estimatedProjectCost),
        projectManagerId: String(project.projectManagerId),
        seniorProjectMangerId: String(project.seniorProjectManagerId),
        regionalManagerId: String(project.regionalManagerId)
      };

      projects[index] = formattedProject;
      return formattedProject;
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error(`Error updating project ${id}:`, error);
      throw new Error(
        error.message || 
        error.response?.data?.message || 
        error.response?.data?.title ||
        'Failed to update project'
      );
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const initialLength = projects.length;
      const filteredProjects = projects.filter(p => String(p.id) !== id);
      
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
