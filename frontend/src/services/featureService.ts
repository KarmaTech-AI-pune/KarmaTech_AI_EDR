import { axiosInstance } from './axiosConfig';
import { Feature, CreateFeatureRequest, UpdateFeatureRequest } from '../types/Feature';

export const featureService = {
  // Get all features
  getAllFeatures: async (): Promise<Feature[]> => {
    const response = await axiosInstance.get('/api/feature');
    return response.data;
  },

  // Get feature by ID
  getFeatureById: async (id: number): Promise<Feature> => {
    const response = await axiosInstance.get(`/api/feature/${id}`);
    return response.data;
  },

  // Create new feature
  createFeature: async (data: CreateFeatureRequest): Promise<Feature> => {
    const response = await axiosInstance.post('/api/feature', data);
    return response.data;
  },

  // Update existing feature
  updateFeature: async (data: UpdateFeatureRequest): Promise<Feature> => {
    const response = await axiosInstance.put(`/api/feature/${data.id}`, data);
    return response.data;
  },

  // Delete feature
  deleteFeature: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/feature/${id}`);
  }
};
