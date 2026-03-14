import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { featureService } from './featureService';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';
import { Feature, CreateFeatureRequest, UpdateFeatureRequest } from '../types/Feature';

describe('featureService', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  const mockFeature: Feature = { id: 1, name: 'Test Feature', description: 'desc', isEnabled: true } as any;

  describe('getAllFeatures', () => {
    it('returns all features', async () => {
      mockAxios.onGet('/api/feature').reply(200, [mockFeature]);
      const result = await featureService.getAllFeatures();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('throws error on failure', async () => {
      mockAxios.onGet('/api/feature').reply(500);
      await expect(featureService.getAllFeatures()).rejects.toThrow();
    });
  });

  describe('getFeatureById', () => {
    it('returns feature correctly', async () => {
      mockAxios.onGet('/api/feature/1').reply(200, mockFeature);
      const result = await featureService.getFeatureById(1);
      expect(result.id).toBe(1);
    });

    it('throws error on failure', async () => {
      mockAxios.onGet('/api/feature/1').reply(500);
      await expect(featureService.getFeatureById(1)).rejects.toThrow();
    });
  });

  describe('createFeature', () => {
    it('creates and returns feature', async () => {
      const createData: CreateFeatureRequest = { name: 'New', description: 'Desc', isActive: true };
      mockAxios.onPost('/api/feature').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(createData);
        return [200, mockFeature];
      });

      const result = await featureService.createFeature(createData);
      expect(result.id).toBe(1);
    });

    it('throws error on failure', async () => {
      mockAxios.onPost('/api/feature').reply(500);
      await expect(featureService.createFeature({} as any)).rejects.toThrow();
    });
  });

  describe('updateFeature', () => {
    it('updates and returns feature', async () => {
      const updateData: UpdateFeatureRequest = { id: 1, name: 'Updated', description: 'Desc', isActive: false };
      mockAxios.onPut('/api/feature/1').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(updateData);
        return [200, mockFeature];
      });

      const result = await featureService.updateFeature(updateData);
      expect(result.id).toBe(1);
    });

    it('throws error on failure', async () => {
      mockAxios.onPut('/api/feature/1').reply(500);
      await expect(featureService.updateFeature({ id: 1 } as any)).rejects.toThrow();
    });
  });

  describe('deleteFeature', () => {
    it('deletes successfully', async () => {
      mockAxios.onDelete('/api/feature/1').reply(200);
      await featureService.deleteFeature(1);
    });

    it('throws error on failure', async () => {
      mockAxios.onDelete('/api/feature/1').reply(500);
      await expect(featureService.deleteFeature(1)).rejects.toThrow();
    });
  });
});
