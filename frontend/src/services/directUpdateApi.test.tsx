import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { directUpdateInward, directUpdateOutward } from './directUpdateApi';

describe('directUpdateApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('directUpdateInward', () => {
    it('sends PUT request and returns data', async () => {
      const mockData = { title: 'Inward Test' };
      const expectedResponse = { id: 1, ...mockData };

      mockAxios.onPut('/api/correspondence/inward/1').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(mockData);
        return [200, expectedResponse];
      });

      const result = await directUpdateInward('1', mockData);
      expect(result).toEqual(expectedResponse);
    });

    it('accepts numeric id', async () => {
      mockAxios.onPut('/api/correspondence/inward/2').reply(200, { id: 2 });
      const result = await directUpdateInward(2, { title: 'hello' });
      expect(result).toEqual({ id: 2 });
    });

    it('throws on error', async () => {
      mockAxios.onPut('/api/correspondence/inward/3').reply(500);
      await expect(directUpdateInward(3, {})).rejects.toThrow();
    });
  });

  describe('directUpdateOutward', () => {
    it('sends PUT request and returns data', async () => {
      const mockData = { title: 'Outward Test' };
      const expectedResponse = { id: 1, ...mockData };

      mockAxios.onPut('/api/correspondence/outward/1').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(mockData);
        return [200, expectedResponse];
      });

      const result = await directUpdateOutward('1', mockData);
      expect(result).toEqual(expectedResponse);
    });

    it('accepts numeric id', async () => {
      mockAxios.onPut('/api/correspondence/outward/2').reply(200, { id: 2 });
      const result = await directUpdateOutward(2, { title: 'hello' });
      expect(result).toEqual({ id: 2 });
    });

    it('throws on error', async () => {
      mockAxios.onPut('/api/correspondence/outward/3').reply(500);
      await expect(directUpdateOutward(3, {})).rejects.toThrow();
    });
  });
});
