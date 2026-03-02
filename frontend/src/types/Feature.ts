export interface Feature {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface CreateFeatureRequest {
  name: string;
  description: string;
  isActive: boolean;
}

export interface UpdateFeatureRequest {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface FeatureFormData {
  name: string;
  description: string;
  isActive: boolean;
}
