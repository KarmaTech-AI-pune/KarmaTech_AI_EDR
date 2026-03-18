import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import {
  getInwardRows, getInwardRowById, createInwardRow, updateInwardRow, deleteInwardRow,
  getOutwardRows, getOutwardRowById, createOutwardRow, updateOutwardRow, deleteOutwardRow,
} from './correspondenceApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('correspondenceApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('Inward', () => {
    it('getInwardRows', async () => {
      mockAxios.onGet('/api/correspondence/inward/project/1').reply(200, [{ id: 1 }]);
      const result = await getInwardRows('1');
      expect(result).toHaveLength(1);
    });

    it('getInwardRowById', async () => {
      mockAxios.onGet('/api/correspondence/inward/1').reply(200, { id: 1 });
      const result = await getInwardRowById(1);
      expect(result.id).toBe(1);
    });

    it('createInwardRow', async () => {
      mockAxios.onPost('/api/correspondence/inward').reply(200, { id: 1 });
      const result = await createInwardRow({} as any);
      expect(result.id).toBe(1);
    });

    it('updateInwardRow', async () => {
      mockAxios.onPut('/api/correspondence/inward/1').reply(200, { id: 1 });
      const result = await updateInwardRow(1, {} as any);
      expect(result.id).toBe(1);
    });

    it('deleteInwardRow', async () => {
      mockAxios.onDelete('/api/correspondence/inward/1').reply(200);
      await deleteInwardRow(1);
    });

    it('getInwardRows throws on error', async () => {
      mockAxios.onGet('/api/correspondence/inward/project/1').reply(500);
      await expect(getInwardRows('1')).rejects.toThrow();
    });
  });

  describe('Outward', () => {
    it('getOutwardRows', async () => {
      mockAxios.onGet('/api/correspondence/outward/project/1').reply(200, [{ id: 1 }]);
      const result = await getOutwardRows('1');
      expect(result).toHaveLength(1);
    });

    it('getOutwardRowById', async () => {
      mockAxios.onGet('/api/correspondence/outward/1').reply(200, { id: 1 });
      const result = await getOutwardRowById(1);
      expect(result.id).toBe(1);
    });

    it('createOutwardRow', async () => {
      mockAxios.onPost('/api/correspondence/outward').reply(200, { id: 1 });
      const result = await createOutwardRow({} as any);
      expect(result.id).toBe(1);
    });

    it('updateOutwardRow', async () => {
      mockAxios.onPut('/api/correspondence/outward/1').reply(200, { id: 1 });
      const result = await updateOutwardRow(1, {} as any);
      expect(result.id).toBe(1);
    });

    it('deleteOutwardRow', async () => {
      mockAxios.onDelete('/api/correspondence/outward/1').reply(200);
      await deleteOutwardRow(1);
    });

    it('getOutwardRows throws on error', async () => {
      mockAxios.onGet('/api/correspondence/outward/project/1').reply(500);
      await expect(getOutwardRows('1')).rejects.toThrow();
    });
  });
});
