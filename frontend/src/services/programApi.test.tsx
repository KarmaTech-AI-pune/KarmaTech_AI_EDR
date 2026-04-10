import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { programApi } from './programApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('programApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  it('getAll returns programs', async () => {
    mockAxios.onGet('api/Program').reply(200, [{ id: 1, name: 'Test' }]);
    const result = await programApi.getAll();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('getById returns a program', async () => {
    mockAxios.onGet('api/Program/1').reply(200, { id: 1, name: 'Test' });
    const result = await programApi.getById(1);
    expect(result.id).toBe(1);
  });

  it('create returns new id', async () => {
    mockAxios.onPost('api/Program').reply(200, { id: 5 });
    const result = await programApi.create({} as any);
    expect(result).toBe(5);
  });

  it('update sends correct payload', async () => {
    mockAxios.onPut('api/Program/1').reply((config) => {
      const data = JSON.parse(config.data);
      expect(data.id).toBe(1);
      return [200, {}];
    });
    await programApi.update(1, { name: 'Updated' } as any);
  });

  it('delete calls correct endpoint', async () => {
    mockAxios.onDelete('api/Program/1').reply(200);
    await programApi.delete(1);
  });

  it('getAll throws on error', async () => {
    mockAxios.onGet('api/Program').reply(500);
    await expect(programApi.getAll()).rejects.toThrow();
  });
});
