import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { applyMigrations } from './migrationService';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('migrationService', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('applyMigrations', () => {
    it('returns results from response', async () => {
      mockAxios.onPost('/api/Tenants/apply-migrations').reply(200, { results: ['migration1', 'migration2'] });
      const result = await applyMigrations();
      expect(result).toEqual(['migration1', 'migration2']);
    });

    it('throws on error', async () => {
      mockAxios.onPost('/api/Tenants/apply-migrations').reply(500);
      await expect(applyMigrations()).rejects.toThrow();
    });
  });
});
