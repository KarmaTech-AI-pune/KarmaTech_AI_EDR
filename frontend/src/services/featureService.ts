import axios from 'axios';
import { Feature, CreateFeatureRequest, UpdateFeatureRequest } from '../types/Feature';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const featureService = {
  // Get all features
  getAllFeatures: async (): Promise<Feature[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/feature`);
    return response.data;
  },

  // Get feature by ID
  getFeatureById: async (id: number): Promise<Feature> => {
    const response = await axios.get(`${API_BASE_URL}/api/feature/${id}`);
    return response.data;
  },

  // Create new feature
  createFeature: async (data: CreateFeatureRequest): Promise<Feature> => {
    const response = await axios.post(`${API_BASE_URL}/api/feature`, data);
    return response.data;
  },

  // Update existing feature
  updateFeature: async (data: UpdateFeatureRequest): Promise<Feature> => {
    const response = await axios.put(`${API_BASE_URL}/api/feature/${data.id}`, data);
    return response.data;
  },

  // Delete feature
  deleteFeature: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/api/feature/${id}`);
  }
};
