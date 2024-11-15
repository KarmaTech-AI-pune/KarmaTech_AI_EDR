import { GoNoGoDecision } from '../types';
import { goNoGoDecisions, getGoNoGoByProjectId } from './database/dummygoNoGo';

export const goNoGoApi = {
  getAll: async (): Promise<GoNoGoDecision[]> => {
    try {
      return goNoGoDecisions;
    } catch (error) {
      console.error('Error fetching Go/No-Go decisions:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<GoNoGoDecision> => {
    try {
      const decision = goNoGoDecisions.find(d => d.projectId === id);
      if (!decision) {
        throw new Error(`Go/No-Go decision for project ${id} not found`);
      }
      return decision;
    } catch (error) {
      console.error(`Error fetching Go/No-Go decision ${id}:`, error);
      throw error;
    }
  },

  getByProjectId: async (projectId: number): Promise<GoNoGoDecision | null> => {
    try {
      const decision = getGoNoGoByProjectId(projectId);
      return decision || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Error fetching Go/No-Go decision for project ${projectId}:`, error);
      throw error;
    }
  },

  create: async (projectId: number, data: GoNoGoDecision): Promise<GoNoGoDecision> => {
    try {
      console.log(`Creating GoNoGo Decision for Project ${projectId}:`, JSON.stringify(data));
      const newDecision = {
        ...data,
        projectId,
        createdAt: new Date().toISOString(),
        createdBy: 'System'
      };
      goNoGoDecisions.push(newDecision);
      return newDecision;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const validationErrors = error.response.data.errors;
        console.error('Validation Errors:', validationErrors);
        throw new Error(validationErrors.join(', '));
      }
      console.error(`Error creating go/no-go decision for project ${projectId}:`, error);
      throw error;
    }
  },

  update: async (id: number, data: GoNoGoDecision): Promise<GoNoGoDecision> => {
    try {
      console.log(`Updating GoNoGo Decision ${id}:`, JSON.stringify(data));
      const index = goNoGoDecisions.findIndex(d => d.projectId === id);
      if (index === -1) {
        throw new Error(`Go/No-Go decision for project ${id} not found`);
      }
      const updatedDecision = {
        ...data,
        projectId: id,
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
      };
      goNoGoDecisions[index] = updatedDecision;
      return updatedDecision;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const validationErrors = error.response.data.errors;
        console.error('Validation Errors:', validationErrors);
        throw new Error(validationErrors.join(', '));
      }
      console.error(`Error updating go/no-go decision ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const index = goNoGoDecisions.findIndex(d => d.projectId === id);
      if (index !== -1) {
        goNoGoDecisions.splice(index, 1);
      } else {
        throw new Error(`Go/No-Go decision for project ${id} not found`);
      }
    } catch (error) {
      console.error(`Error deleting Go/No-Go decision ${id}:`, error);
      throw error;
    }
  }
};
