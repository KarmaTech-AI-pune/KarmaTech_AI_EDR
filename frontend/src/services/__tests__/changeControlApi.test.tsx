import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { changeControlApi } from '../changeControlApi';
import { axiosInstance } from '../axiosConfig';

// Mock axiosInstance
vi.mock('../axiosConfig', () => ({
  axiosInstance: {
    post: vi.fn(),
  },
}));

const mockAxiosPost = vi.mocked(axiosInstance.post);

describe('changeControlApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockCommand = { projectId: 1, remarks: 'Test' };
  const mockResponse = { data: { success: true, message: 'Operation successful' } };

  describe('sendToReview', () => {
    it('should successfully post to sendtoreview and return data', async () => {
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const result = await changeControlApi.sendToReview(mockCommand);

      expect(mockAxiosPost).toHaveBeenCalledWith('api/PMWorkflow/sendtoreview', mockCommand);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when api call fails', async () => {
      const error = new Error('Network error');
      mockAxiosPost.mockRejectedValueOnce(error);

      await expect(changeControlApi.sendToReview(mockCommand)).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalledWith('Error getting all projects:', error);
    });
  });

  describe('sendToApprovalBySPM', () => {
    it('should successfully post to sendToApproval and return data', async () => {
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const result = await changeControlApi.sendToApprovalBySPM(mockCommand);

      expect(mockAxiosPost).toHaveBeenCalledWith('api/PMWorkflow/sendToApproval', mockCommand);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when api call fails', async () => {
      const error = new Error('Network error');
      mockAxiosPost.mockRejectedValueOnce(error);

      await expect(changeControlApi.sendToApprovalBySPM(mockCommand)).rejects.toThrow('Network error');
    });
  });

  describe('rejectBySPM', () => {
    it('should successfully post to requestChanges and return data', async () => {
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const result = await changeControlApi.rejectBySPM(mockCommand);

      expect(mockAxiosPost).toHaveBeenCalledWith('api/PMWorkflow/requestChanges', mockCommand);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when api call fails', async () => {
      const error = new Error('Network error');
      mockAxiosPost.mockRejectedValueOnce(error);

      await expect(changeControlApi.rejectBySPM(mockCommand)).rejects.toThrow('Network error');
    });
  });

  describe('approvedByRDOrRM', () => {
    it('should successfully post to approve and return data', async () => {
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const result = await changeControlApi.approvedByRDOrRM(mockCommand);

      expect(mockAxiosPost).toHaveBeenCalledWith('api/PMWorkflow/approve', mockCommand);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when api call fails', async () => {
      const error = new Error('Network error');
      mockAxiosPost.mockRejectedValueOnce(error);

      await expect(changeControlApi.approvedByRDOrRM(mockCommand)).rejects.toThrow('Network error');
    });
  });

  describe('rejectByRDOrRM', () => {
    it('should successfully post to requestChanges and return data', async () => {
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const result = await changeControlApi.rejectByRDOrRM(mockCommand);

      expect(mockAxiosPost).toHaveBeenCalledWith('api/PMWorkflow/requestChanges', mockCommand);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when api call fails', async () => {
      const error = new Error('Network error');
      mockAxiosPost.mockRejectedValueOnce(error);

      await expect(changeControlApi.rejectByRDOrRM(mockCommand)).rejects.toThrow('Network error');
    });
  });
});
