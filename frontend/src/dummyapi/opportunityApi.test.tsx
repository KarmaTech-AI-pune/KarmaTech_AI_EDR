import { describe, it, expect, vi, beforeEach } from 'vitest'
import { opportunityApi, BackendOpportunityTracking } from './opportunityApi'
import { axiosInstance } from '../services/axiosConfig'
import { OpportunityTracking } from '../models/opportunityTrackingModel'

// Mock axios instance
vi.mock('../services/axiosConfig', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('opportunityApi', () => {
  // Sample opportunity data for tests
  const sampleOpportunity: Partial<OpportunityTracking> = {
    workName: 'Test Project',
    client: 'Test Client',
    clientSector: 'Energy',
    stage: 'B',
    strategicRanking: 'H',
    bidManagerId: 'bd1',
    reviewManagerId: 'rm1',
    approvalManagerId: 'am1',
    operation: 'New Construction',
    status: 'Bid Under Preparation',
    currency: 'USD',
    capitalValue: 1000000,
    durationOfProject: 12,
    fundingStream: 'Government Budget',
    contractType: 'Lump Sum',
    dateOfSubmission: '2025-03-17',
    likelyStartDate: '2025-04-01'
  }

  // Sample backend response
  const backendResponse: BackendOpportunityTracking = {
    id: 1,
    workName: 'Test Project',
    client: 'Test Client',
    clientSector: 'Energy',
    stage: 2, // B
    strategicRanking: 'H',
    bidManagerId: 'bd1',
    reviewManagerId: 'rm1',
    approvalManagerId: 'am1',
    operation: 'New Construction',
    status: 0, // Bid Under Preparation
    currency: 'USD',
    capitalValue: 1000000,
    durationOfProject: 12,
    fundingStream: 'Government Budget',
    contractType: 'Lump Sum',
    dateOfSubmission: '2025-03-17',
    likelyStartDate: '2025-04-01',
    createdAt: '2025-03-15T10:30:00Z',
    updatedAt: '2025-03-16T14:45:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Stage Mapping', () => {
    it('maps frontend stage strings to backend numeric values', async () => {
      // Setup mock response
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: backendResponse
      })

      // Call create method
      await opportunityApi.create(sampleOpportunity)

      // Check that the correct stage value was sent to the backend
      expect(axiosInstance.post).toHaveBeenCalledWith(
        'api/OpportunityTracking',
        expect.objectContaining({
          stage: 2 // B maps to 2
        })
      )
    })

    it('maps backend numeric stage values to frontend strings', async () => {
      // Setup mock response
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: [backendResponse]
      })

      // Call getAll method
      const result = await opportunityApi.getAll()

      // Check that the stage was correctly mapped
      expect(result[0].stage).toBe('B')
    })

    it('handles all stage mappings correctly', async () => {
      // Test all stage mappings
      const stageTestCases = [
        { frontend: 'A', backend: 1 },
        { frontend: 'B', backend: 2 },
        { frontend: 'C', backend: 3 },
        { frontend: 'D', backend: 4 },
        { frontend: 'E', backend: 5 },
        { frontend: undefined, backend: 1 } // Default case
      ]

      for (const testCase of stageTestCases) {
        // Setup mock response for create
        vi.mocked(axiosInstance.post).mockReset()
        vi.mocked(axiosInstance.post).mockResolvedValueOnce({
          data: { ...backendResponse, stage: testCase.backend }
        })

        // Call create with the test stage
        await opportunityApi.create({
          ...sampleOpportunity,
          stage: testCase.frontend
        })

        // Check that the correct stage value was sent to the backend
        expect(axiosInstance.post).toHaveBeenCalledWith(
          'api/OpportunityTracking',
          expect.objectContaining({
            stage: testCase.backend
          })
        )

        // Setup mock response for getAll
        vi.mocked(axiosInstance.get).mockReset()
        vi.mocked(axiosInstance.get).mockResolvedValueOnce({
          data: [{ ...backendResponse, stage: testCase.backend }]
        })

        // Call getAll method
        const result = await opportunityApi.getAll()

        // Check that the stage was correctly mapped back
        expect(result[0].stage).toBe(testCase.frontend || 'A') // Default to 'A' if undefined
      }
    })
  })

  describe('Status Mapping', () => {
    it('maps frontend status strings to backend numeric values', async () => {
      // Setup mock response
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: backendResponse
      })

      // Call create method
      await opportunityApi.create(sampleOpportunity)

      // Check that the correct status value was sent to the backend
      expect(axiosInstance.post).toHaveBeenCalledWith(
        'api/OpportunityTracking',
        expect.objectContaining({
          status: 0 // Bid Under Preparation maps to 0
        })
      )
    })

    it('maps backend numeric status values to frontend strings', async () => {
      // Setup mock response
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: [backendResponse]
      })

      // Call getAll method
      const result = await opportunityApi.getAll()

      // Check that the status was correctly mapped
      expect(result[0].status).toBe('Bid Under Preparation')
    })

    it('handles all status mappings correctly', async () => {
      // Test all status mappings
      const statusTestCases = [
        { frontend: 'Bid Under Preparation', backend: 0 },
        { frontend: 'Bid Submitted', backend: 1 },
        { frontend: 'Bid Rejected', backend: 2 },
        { frontend: 'Bid Accepted', backend: 3 },
        { frontend: undefined, backend: 0 } // Default case
      ]

      for (const testCase of statusTestCases) {
        // Setup mock response for create
        vi.mocked(axiosInstance.post).mockReset()
        vi.mocked(axiosInstance.post).mockResolvedValueOnce({
          data: { ...backendResponse, status: testCase.backend }
        })

        // Call create with the test status
        await opportunityApi.create({
          ...sampleOpportunity,
          status: testCase.frontend
        })

        // Check that the correct status value was sent to the backend
        expect(axiosInstance.post).toHaveBeenCalledWith(
          'api/OpportunityTracking',
          expect.objectContaining({
            status: testCase.backend
          })
        )

        // Setup mock response for getAll
        vi.mocked(axiosInstance.get).mockReset()
        vi.mocked(axiosInstance.get).mockResolvedValueOnce({
          data: [{ ...backendResponse, status: testCase.backend }]
        })

        // Call getAll method
        const result = await opportunityApi.getAll()

        // Check that the status was correctly mapped back
        expect(result[0].status).toBe(testCase.frontend || 'Bid Under Preparation') // Default if undefined
      }
    })
  })

  describe('API Methods', () => {
    it('creates an opportunity with correct data transformation', async () => {
      // Setup mock response
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: backendResponse
      })

      // Call create method
      const result = await opportunityApi.create(sampleOpportunity)

      // Check that the API was called with transformed data
      expect(axiosInstance.post).toHaveBeenCalledWith(
        'api/OpportunityTracking',
        expect.objectContaining({
          workName: sampleOpportunity.workName,
          client: sampleOpportunity.client,
          stage: 2, // B maps to 2
          status: 0, // Bid Under Preparation maps to 0
          bidManagerId: sampleOpportunity.bidManagerId
        })
      )

      // Check that the response was transformed back
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          workName: 'Test Project',
          stage: 'B',
          status: 'Bid Under Preparation',
          client: 'Test Client'
        })
      )
    })

    // it('updates an opportunity with correct data transformation', async () => {
    //   // Setup mock response
    //   vi.mocked(axiosInstance.put).mockResolvedValueOnce({
    //     data: backendResponse
    //   })

    //   // Call update method
    //   const result = await opportunityApi.update(1, sampleOpportunity)

    //   // Check that the API was called with transformed data
    //   expect(axiosInstance.put).toHaveBeenCalledWith(
    //     'api/OpportunityTracking/1',
    //     expect.objectContaining({
    //       id: 1,
    //       workName: sampleOpportunity.workName,
    //       client: sampleOpportunity.client,
    //       stage: 2, // B maps to 2
    //       status: 0 // Bid Under Preparation maps to 0
    //     })
    //   )

    //   // Check that the response was transformed back
    //   expect(result).toEqual(expect.objectContaining({
    //     id: 1,
    //     workName: 'Test Project',
    //     client: 'Test Client',
    //     clientSector: 'Energy',
    //     stage: 'B',
    //     strategicRanking: 'H',
    //     bidManagerId: 'bd1',
    //     reviewManagerId: 'rm1',
    //     approvalManagerId: 'am1',
    //     operation: 'New Construction',
    //     status: 'Bid Under Preparation',
    //     currency: 'USD',
    //     capitalValue: 1000000,
    //     durationOfProject: 12,
    //     fundingStream: 'Government Budget',
    //     contractType: 'Lump Sum',
    //     dateOfSubmission: typeof result.dateOfSubmission === 'string' ? result.dateOfSubmission : '2025-03-17',
    //     likelyStartDate: typeof result.likelyStartDate === 'string' ? result.likelyStartDate : '2025-04-01',
    //     createdAt: expect.any(Date), // Dates are normalized to Date objects
    //     updatedAt: expect.any(Date)  // Dates are normalized to Date objects
    //   }))
    // })

    it('gets all opportunities with correct data transformation', async () => {
      // Setup mock response
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: [backendResponse]
      })

      // Call getAll method
      const result = await opportunityApi.getAll()

      // Check that the API was called
      expect(axiosInstance.get).toHaveBeenCalledWith('api/OpportunityTracking')

      // Check that the response was transformed
      expect(result).toEqual([
        expect.objectContaining({
          id: 1,
          workName: 'Test Project',
          stage: 'B',
          status: 'Bid Under Preparation'
        })
      ])
    })

    it('gets an opportunity by ID with correct data transformation', async () => {
      // Setup mock response
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: backendResponse
      })

      // Call getById method
      const result = await opportunityApi.getById(1)

      // Check that the API was called
      expect(axiosInstance.get).toHaveBeenCalledWith('api/OpportunityTracking/1')

      // Check that the response was transformed
      expect(result).toEqual(expect.objectContaining({
        id: 1,
        workName: 'Test Project',
        stage: 'B',
        status: 'Bid Under Preparation'
      }))
    })

    it('deletes an opportunity', async () => {
      // Setup mock response
      vi.mocked(axiosInstance.delete).mockResolvedValueOnce({})

      // Call delete method
      await opportunityApi.delete(1)

      // Check that the API was called
      expect(axiosInstance.delete).toHaveBeenCalledWith('api/OpportunityTracking/1')
    })
  })

  describe('Error Handling', () => {
    it('handles errors in create method', async () => {
      // Setup mock error
      const error = new Error('API Error')
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error)

      // Call create method and expect it to throw
      await expect(opportunityApi.create(sampleOpportunity)).rejects.toThrow('API Error')
    })

    it('handles errors in update method', async () => {
      // Setup mock error
      const error = new Error('API Error')
      vi.mocked(axiosInstance.put).mockRejectedValueOnce(error)

      // Call update method and expect it to throw
      await expect(opportunityApi.update(1, sampleOpportunity)).rejects.toThrow('API Error')
    })

    it('handles errors in getAll method', async () => {
      // Setup mock error
      const error = new Error('API Error')
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error)

      // Call getAll method and expect it to throw
      await expect(opportunityApi.getAll()).rejects.toThrow('API Error')
    })

    it('handles errors in getById method', async () => {
      // Setup mock error
      const error = new Error('API Error')
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error)

      // Call getById method and expect it to throw
      await expect(opportunityApi.getById(1)).rejects.toThrow('API Error')
    })

    it('handles errors in delete method', async () => {
      // Setup mock error
      const error = new Error('API Error')
      vi.mocked(axiosInstance.delete).mockRejectedValueOnce(error)

      // Call delete method and expect it to throw
      await expect(opportunityApi.delete(1)).rejects.toThrow('API Error')
    })
  })
})
