import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import {
  createInputRegister,
  getInputRegisterByProject,
  getInputRegisterById,
  updateInputRegister,
  deleteInputRegister,
} from './inputRegisterApi';
import { axiosInstance } from '../services/axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('inputRegisterApi', () => {
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

  it('createInputRegister returns formatted data', async () => {
    mockAxios.onPost('/api/InputRegister').reply(200, { id: 1, projectId: 5 });
    const result = await createInputRegister({ projectId: '5', noOfFiles: 3 } as any);
    expect(result.id).toBe('1');
    expect(result.projectId).toBe('5');
  });

  it('getInputRegisterByProject returns formatted array', async () => {
    mockAxios.onGet('/api/InputRegister/project/5').reply(200, [{ id: 1, projectId: 5 }]);
    const result = await getInputRegisterByProject('5');
    expect(result[0].id).toBe('1');
    expect(result[0].projectId).toBe('5');
  });

  it('getInputRegisterById returns formatted data', async () => {
    mockAxios.onGet('/api/InputRegister/1').reply(200, { id: 1, projectId: 5 });
    const result = await getInputRegisterById('1');
    expect(result?.id).toBe('1');
  });

  it('updateInputRegister merges and puts data', async () => {
    // First call is getInputRegisterById (to get current data)
    mockAxios.onGet('/api/InputRegister/1').reply(200, { id: 1, projectId: 5, dataReceived: 'old' });
    // Second call is the PUT
    mockAxios.onPut('/api/InputRegister/1').reply(200, { id: 1, projectId: 5, dataReceived: 'new' });
    const result = await updateInputRegister('1', { dataReceived: 'new' } as any);
    expect(result?.dataReceived).toBe('new');
  });

  it('deleteInputRegister returns true', async () => {
    mockAxios.onDelete('/api/InputRegister/1').reply(200);
    const result = await deleteInputRegister('1');
    expect(result).toBe(true);
  });

  it('deleteInputRegister throws on error', async () => {
    mockAxios.onDelete('/api/InputRegister/1').reply(500);
    await expect(deleteInputRegister('1')).rejects.toThrow();
  });
});
