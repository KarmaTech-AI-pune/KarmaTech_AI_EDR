/**
 * PaymentScheduleAPI Service Tests
 * 
 * Comprehensive test suite for PaymentScheduleAPI service
 * Tests: API calls, error handling, data transformation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaymentScheduleAPI } from '../../../src/features/cashflow/services/paymentScheduleApi';
import { axiosInstance } from '../../../src/services/axiosConfig';
import { PaymentScheduleData, PaymentMilestone } from '../../../src/features/cashflow/types/cashflow';

// Mock axios
vi.mock('../../../src/services/axiosConfig', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('PaymentScheduleAPI Service', () => {
  const mockProjectId = 'test-project-123';

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear console mocks
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPaymentMilestones', () => {
    const mockPaymentScheduleData: PaymentScheduleData = {
      milestones: [
        {
          id: 1,
          description: 'Inception Report',
          percentage: 10,
          amountINR: 50000,
          dueDate: '2025-01-15',
        },
        {
          id: 2,
          description: 'Final Report',
          percentage: 20,
          amountINR: 100000,
          dueDate: '2025-06-15',
        },
      ],
      totalPercentage: 30,
      totalAmountINR: 150000,
      totalProjectFee: 500000,
    };

    it('successfully fetches payment milestones', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: mockPaymentScheduleData,
      });

      const result = await PaymentScheduleAPI.getPaymentMilestones(mockProjectId);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/cashflows/payment-milestones`
      );
      expect(result).toEqual(mockPaymentScheduleData);
    });

    it('logs the fetch request', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: mockPaymentScheduleData,
      });

      await PaymentScheduleAPI.getPaymentMilestones(mockProjectId);

      expect(console.log).toHaveBeenCalledWith(
        'PaymentScheduleAPI: Fetching payment milestones for projectId:',
        mockProjectId
      );
    });

    it('logs successful fetch', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: mockPaymentScheduleData,
      });

      await PaymentScheduleAPI.getPaymentMilestones(mockProjectId);

      expect(console.log).toHaveBeenCalledWith(
        'PaymentScheduleAPI: Payment milestones fetched successfully:',
        mockPaymentScheduleData
      );
    });

    it('throws error when API call fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(axiosInstance.get).mockRejectedValue(mockError);

      await expect(
        PaymentScheduleAPI.getPaymentMilestones(mockProjectId)
      ).rejects.toThrow('Failed to fetch payment milestones');
    });

    it('logs error when API call fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(axiosInstance.get).mockRejectedValue(mockError);

      try {
        await PaymentScheduleAPI.getPaymentMilestones(mockProjectId);
      } catch (error) {
        // Expected to throw
      }

      expect(console.error).toHaveBeenCalledWith(
        'PaymentScheduleAPI: Error fetching payment milestones:',
        mockError
      );
    });

    it('handles empty milestones array', async () => {
      const emptyData: PaymentScheduleData = {
        milestones: [],
        totalPercentage: 0,
        totalAmountINR: 0,
        totalProjectFee: 500000,
      };

      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: emptyData,
      });

      const result = await PaymentScheduleAPI.getPaymentMilestones(mockProjectId);

      expect(result).toEqual(emptyData);
      expect(result.milestones).toHaveLength(0);
    });

    it('handles milestones without due dates', async () => {
      const dataWithoutDates: PaymentScheduleData = {
        milestones: [
          {
            id: 1,
            description: 'Milestone 1',
            percentage: 50,
            amountINR: 250000,
          },
        ],
        totalPercentage: 50,
        totalAmountINR: 250000,
        totalProjectFee: 500000,
      };

      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: dataWithoutDates,
      });

      const result = await PaymentScheduleAPI.getPaymentMilestones(mockProjectId);

      expect(result.milestones[0].dueDate).toBeUndefined();
    });

    it('calls correct API endpoint', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: mockPaymentScheduleData,
      });

      await PaymentScheduleAPI.getPaymentMilestones(mockProjectId);

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(axiosInstance.get).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/cashflows/payment-milestones`
      );
    });
  });

  describe('addPaymentMilestone', () => {
    const mockNewMilestone: Omit<PaymentMilestone, 'id'> = {
      description: 'New Milestone',
      percentage: 15,
      amountINR: 75000,
      dueDate: '2025-03-15',
    };

    const mockCreatedMilestone: PaymentMilestone = {
      id: 3,
      ...mockNewMilestone,
    };

    it('successfully adds a payment milestone', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: mockCreatedMilestone,
      });

      const result = await PaymentScheduleAPI.addPaymentMilestone(
        mockProjectId,
        mockNewMilestone
      );

      expect(axiosInstance.post).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/cashflows/payment-milestones`,
        mockNewMilestone
      );
      expect(result).toEqual(mockCreatedMilestone);
    });

    it('logs the add request', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: mockCreatedMilestone,
      });

      await PaymentScheduleAPI.addPaymentMilestone(mockProjectId, mockNewMilestone);

      expect(console.log).toHaveBeenCalledWith(
        'PaymentScheduleAPI: Adding payment milestone for projectId:',
        mockProjectId,
        mockNewMilestone
      );
    });

    it('logs successful addition', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: mockCreatedMilestone,
      });

      await PaymentScheduleAPI.addPaymentMilestone(mockProjectId, mockNewMilestone);

      expect(console.log).toHaveBeenCalledWith(
        'PaymentScheduleAPI: Payment milestone added successfully:',
        mockCreatedMilestone
      );
    });

    it('throws error when API call fails', async () => {
      const mockError = new Error('Server error');
      vi.mocked(axiosInstance.post).mockRejectedValue(mockError);

      await expect(
        PaymentScheduleAPI.addPaymentMilestone(mockProjectId, mockNewMilestone)
      ).rejects.toThrow('Failed to add payment milestone');
    });

    it('logs error when API call fails', async () => {
      const mockError = new Error('Server error');
      vi.mocked(axiosInstance.post).mockRejectedValue(mockError);

      try {
        await PaymentScheduleAPI.addPaymentMilestone(mockProjectId, mockNewMilestone);
      } catch (error) {
        // Expected to throw
      }

      expect(console.error).toHaveBeenCalledWith(
        'PaymentScheduleAPI: Error adding payment milestone:',
        mockError
      );
    });

    it('adds milestone without due date', async () => {
      const milestoneWithoutDate: Omit<PaymentMilestone, 'id'> = {
        description: 'Milestone without date',
        percentage: 10,
        amountINR: 50000,
      };

      const createdMilestone: PaymentMilestone = {
        id: 4,
        ...milestoneWithoutDate,
      };

      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: createdMilestone,
      });

      const result = await PaymentScheduleAPI.addPaymentMilestone(
        mockProjectId,
        milestoneWithoutDate
      );

      expect(result.dueDate).toBeUndefined();
      expect(axiosInstance.post).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/cashflows/payment-milestones`,
        milestoneWithoutDate
      );
    });

    it('handles decimal percentages', async () => {
      const milestoneWithDecimal: Omit<PaymentMilestone, 'id'> = {
        description: 'Decimal Milestone',
        percentage: 12.5,
        amountINR: 62500,
        dueDate: '2025-04-15',
      };

      const createdMilestone: PaymentMilestone = {
        id: 5,
        ...milestoneWithDecimal,
      };

      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: createdMilestone,
      });

      const result = await PaymentScheduleAPI.addPaymentMilestone(
        mockProjectId,
        milestoneWithDecimal
      );

      expect(result.percentage).toBe(12.5);
    });

    it('calls correct API endpoint with correct data', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: mockCreatedMilestone,
      });

      await PaymentScheduleAPI.addPaymentMilestone(mockProjectId, mockNewMilestone);

      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.post).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/cashflows/payment-milestones`,
        mockNewMilestone
      );
    });

    it('returns milestone with generated id', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: mockCreatedMilestone,
      });

      const result = await PaymentScheduleAPI.addPaymentMilestone(
        mockProjectId,
        mockNewMilestone
      );

      expect(result.id).toBeDefined();
      expect(result.id).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('handles very large amounts', async () => {
      const largeAmountData: PaymentScheduleData = {
        milestones: [
          {
            id: 1,
            description: 'Large Milestone',
            percentage: 100,
            amountINR: 10000000000, // 10 billion
          },
        ],
        totalPercentage: 100,
        totalAmountINR: 10000000000,
        totalProjectFee: 10000000000,
      };

      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: largeAmountData,
      });

      const result = await PaymentScheduleAPI.getPaymentMilestones(mockProjectId);

      expect(result.totalAmountINR).toBe(10000000000);
    });

    it('handles special characters in description', async () => {
      const specialCharMilestone: Omit<PaymentMilestone, 'id'> = {
        description: 'Milestone with special chars: @#$%^&*()',
        percentage: 10,
        amountINR: 50000,
      };

      const createdMilestone: PaymentMilestone = {
        id: 6,
        ...specialCharMilestone,
      };

      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: createdMilestone,
      });

      const result = await PaymentScheduleAPI.addPaymentMilestone(
        mockProjectId,
        specialCharMilestone
      );

      expect(result.description).toBe('Milestone with special chars: @#$%^&*()');
    });

    it('handles different project ID formats', async () => {
      const uuidProjectId = '550e8400-e29b-41d4-a716-446655440000';
      
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: {
          milestones: [],
          totalPercentage: 0,
          totalAmountINR: 0,
          totalProjectFee: 0,
        },
      });

      await PaymentScheduleAPI.getPaymentMilestones(uuidProjectId);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        `/api/projects/${uuidProjectId}/cashflows/payment-milestones`
      );
    });
  });

  describe('Error Scenarios', () => {
    it('handles network timeout', async () => {
      const timeoutError = new Error('Network timeout');
      vi.mocked(axiosInstance.get).mockRejectedValue(timeoutError);

      await expect(
        PaymentScheduleAPI.getPaymentMilestones(mockProjectId)
      ).rejects.toThrow('Failed to fetch payment milestones');
    });

    it('handles 404 error', async () => {
      const notFoundError = { response: { status: 404 } };
      vi.mocked(axiosInstance.get).mockRejectedValue(notFoundError);

      await expect(
        PaymentScheduleAPI.getPaymentMilestones(mockProjectId)
      ).rejects.toThrow('Failed to fetch payment milestones');
    });

    it('handles 500 server error', async () => {
      const serverError = { response: { status: 500 } };
      vi.mocked(axiosInstance.post).mockRejectedValue(serverError);

      await expect(
        PaymentScheduleAPI.addPaymentMilestone(mockProjectId, {
          description: 'Test',
          percentage: 10,
          amountINR: 50000,
        })
      ).rejects.toThrow('Failed to add payment milestone');
    });

    it('handles validation error from server', async () => {
      const validationError = {
        response: {
          status: 400,
          data: { message: 'Invalid percentage' },
        },
      };
      vi.mocked(axiosInstance.post).mockRejectedValue(validationError);

      await expect(
        PaymentScheduleAPI.addPaymentMilestone(mockProjectId, {
          description: 'Test',
          percentage: 150, // Invalid
          amountINR: 50000,
        })
      ).rejects.toThrow('Failed to add payment milestone');
    });
  });
});
