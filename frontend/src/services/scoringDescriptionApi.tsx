import { axiosInstance } from './axiosConfig';

export interface ScoringLevels {
  high: string;
  medium: string;
  low: string;
}

export interface ScoringDescriptionsResponse {
  descriptions: {
    [key: string]: ScoringLevels;
  };
}

export const getScoringDescriptions = async (): Promise<ScoringDescriptionsResponse> => {
  try {
    const response = await axiosInstance.get('/api/ScoringDescription');
    return response.data;
  } catch (error) {
    console.error('Error fetching scoring descriptions:', error);
    throw error;
  }
};
