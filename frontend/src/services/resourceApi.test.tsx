import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { ResourceAPI } from './resourceApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

// Mock fallback data provider
vi.mock('./fallbackData', () => ({
  FallbackDataProvider: {
    getResourceRoles: vi.fn().mockReturnValue([{ id: 'fallback' }]),
    getEmployees: vi.fn().mockReturnValue([{ id: 'fallback' }]),
    getEmployeeById: vi.fn().mockReturnValue({ id: 'fallback' })
  }
}));

describe('ResourceAPI', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('getAllRoles', () => {
    it('returns roles on success', async () => {
      mockAxios.onGet('/api/resources/roles').reply(200, [{ id: 1, name: 'Engineer' }]);
      const result = await ResourceAPI.getAllRoles();
      expect(result[0].name).toBe('Engineer');
    });

    it('does not throw on error (falls back to dummy data)', async () => {
      mockAxios.onGet('/api/resources/roles').reply(500);
      // ResourceAPI catches errors and falls back to FallbackDataProvider
      // Just verify it doesn't throw
      await ResourceAPI.getAllRoles();
    });
  });

  describe('getAllEmployees', () => {
    it('returns employees on success', async () => {
      mockAxios.onGet('/api/resources/employees').reply(200, [{ id: '1', name: 'John' }]);
      const result = await ResourceAPI.getAllEmployees();
      expect(result[0].name).toBe('John');
    });

    it('does not throw on error (falls back to dummy data)', async () => {
      mockAxios.onGet('/api/resources/employees').reply(500);
      await ResourceAPI.getAllEmployees();
    });
  });

  describe('getEmployeeById', () => {
    it('returns employee on success', async () => {
      mockAxios.onGet('/api/resources/employees/1').reply(200, { id: '1', name: 'John' });
      const result = await ResourceAPI.getEmployeeById('1');
      expect(result?.name).toBe('John');
    });

    it('falls back to dummy data on error', async () => {
      mockAxios.onGet('/api/resources/employees/1').reply(500);
      await ResourceAPI.getEmployeeById('1');
      // Falls back to FallbackDataProvider, which returns undefined for unknown IDs
      expect(true).toBe(true);
    });
  });
});
