// import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { projectApi } from './projectApi'
import * as dummyProjects from './database/dummyProjects'
import { Project } from '../models'
import { ProjectStatus } from '../types/index'

// Mock the database module
vi.mock('./database/dummyProjects', async () => {
  const actual = await vi.importActual('./database/dummyProjects') as typeof dummyProjects
  return {
    ...actual,
    projects: [...actual.projects], // Create a copy to avoid test interference
    getProjectById: vi.fn((id: string) => actual.projects.find(p => p.id === id))
  }
})

describe('projectApi', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Reset mocks between tests
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('returns all projects', async () => {
      const result = await projectApi.getAll()
      expect(result).toEqual(dummyProjects.projects)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('getById', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('returns the correct project for a valid ID', async () => {
      const id = '1'
      const result = await projectApi.getById(id)
      expect(result).toEqual(dummyProjects.projects.find(p => p.id === id))
      expect(dummyProjects.getProjectById).toHaveBeenCalledWith(id)
    })

    it('throws an error for non-existent ID', async () => {
      vi.mocked(dummyProjects.getProjectById).mockReturnValueOnce(undefined)
      const id = 'non-existent-id'
      await expect(projectApi.getById(id)).rejects.toThrow(`Project with id ${id} not found`)
    })
  })

  describe('create', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('creates a new project with correct data', async () => {
      const newProject: Omit<Project, 'id'> = {
        name: 'Test Project',
        clientName: 'Test Client',
        projectManagerId: '1',
        projectNo: 'TEST-001',
        seniorProjectManagerId: '2',
        estimatedProjectCost: 100000,
        currency: 'USD',
        regionalManagerId: '3',
        status: ProjectStatus.InProgress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        details: '',
        typeOfJob: '',
        sector: '',
        region: '',
        office: '',
        priority: '',
        typeOfClient: '',
        estimatedProjectFee: 0,
        letterOfAcceptance: false,
        opportunityTrackingId: 0,
        feeType: '',
        fundingStream: 'Mock Stream',
        contractType: 'Mock Contract',
        programId: 1
      } as unknown as Omit<Project, 'id'>

      const result = await projectApi.create(newProject)
      
      // Check that the new project was added to the projects array
      const lastProject = dummyProjects.projects[dummyProjects.projects.length - 1]
      
      expect(result).toEqual(expect.objectContaining({
        ...newProject,
        id: expect.any(String),
      }))
      
      expect(lastProject).toEqual(expect.objectContaining({
        name: 'Test Project',
        clientName: 'Test Client',
      }))
    })

    it('throws an error when required fields are missing', async () => {
      const incompleteProject = {
        name: 'Test Project',
        // Missing required fields
      }

      // Type assertion to Partial<Project> to avoid TypeScript errors while still testing the validation
      await expect(projectApi.create(incompleteProject as Partial<Project> as Omit<Project, 'id'>)).rejects.toThrow('Required fields missing')
    })
  })

  describe('update', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates an existing project correctly', async () => {
      // First, get a project to update
      const projectToUpdate = { ...dummyProjects.projects[0] }
      
      // Make sure we have the required fields with the correct names
      const updatedData = {
        ...projectToUpdate,
        name: 'Updated Project Name',
        clientName: 'Updated Client Name',
        // Ensure these fields are present with the correct names
        projectMangerId: projectToUpdate.projectManagerId || '1',
        seniorProjectMangerId: projectToUpdate.seniorProjectManagerId || '2',
        regionalManagerID: projectToUpdate.regionalManagerId || '3'
      }

      const result = await projectApi.update(projectToUpdate.id, updatedData)
      
      expect(result).toEqual(expect.objectContaining({
        id: projectToUpdate.id,
        name: 'Updated Project Name',
        clientName: 'Updated Client Name'
      }))
      
      // Check that the project was updated in the array
      const updatedProject = dummyProjects.projects.find(p => p.id === projectToUpdate.id)
      expect(updatedProject?.name).toBe('Updated Project Name')
    })

    it('returns null when updating a non-existent project', async () => {
      const nonExistentId = 'non-existent-id'
      const result = await projectApi.update(nonExistentId, {
        id: nonExistentId,
        name: 'Test',
        clientName: 'Test Client',
        projectManagerId: '1', 
        projectNo: 'TEST-001',
        seniorProjectManagerId: '2', 
        estimatedProjectCost: 100000,
        currency: 'USD',
        regionalManagerId: '3', 
        status: ProjectStatus.InProgress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        details: '',
        typeOfJob: '',
        sector: '',
        region: '',
        office: '',
        priority: '',
        typeOfClient: '',
        estimatedProjectFee: 0,
        letterOfAcceptance: false,
        opportunityTrackingId: 0,
        feeType: '',
        fundingStream: 'Mock Stream',
        contractType: 'Mock Contract',
        programId: 1
      } as unknown as Project)
      
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('removes a project correctly', async () => {
      // Get the ID of the first project
      const projectId = dummyProjects.projects[0].id
      const initialLength = dummyProjects.projects.length
      
      const result = await projectApi.delete(projectId)
      
      expect(result).toBe(true)
      expect(dummyProjects.projects.length).toBe(initialLength - 1)
      expect(dummyProjects.projects.find(p => p.id === projectId)).toBeUndefined()
    })

    it('returns false when deleting a non-existent project', async () => {
      const nonExistentId = 'non-existent-id'
      const initialLength = dummyProjects.projects.length
      
      const result = await projectApi.delete(nonExistentId)
      
      expect(result).toBe(false)
      expect(dummyProjects.projects.length).toBe(initialLength)
    })
  })

  describe('validateRequiredFields', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('throws an error when required fields are missing', async () => {
      const incompleteProject = {
        name: 'Test Project',
        // Missing other required fields
      }

      // Type assertion to Partial<Project> to avoid TypeScript errors while still testing the validation
      await expect(projectApi.create(incompleteProject as Partial<Project> as Omit<Project, 'id'>)).rejects.toThrow(/Required fields missing/)
    })

    it('does not throw an error when all required fields are present', async () => {
      const completeProject: Omit<Project, 'id'> = {
        name: 'Test Project',
        clientName: 'Test Client',
        projectManagerId: '1',
        projectNo: 'TEST-001',
        seniorProjectManagerId: '2', 
        estimatedProjectCost: 100000,
        currency: 'USD',
        regionalManagerId: '3', 
        status: ProjectStatus.InProgress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        details: '',
        typeOfJob: '',
        sector: '',
        region: '',
        office: '',
        priority: '',
        typeOfClient: '',
        estimatedProjectFee: 0,
        letterOfAcceptance: false,
        opportunityTrackingId: 0,
        feeType: '',
        fundingStream: 'Mock Stream',
        contractType: 'Mock Contract',
        programId: 1,
      } as unknown as Omit<Project, 'id'>

      await expect(projectApi.create(completeProject)).resolves.not.toThrow()
    })
  })
})


