export interface Feature {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxUsers: number;
  maxProjects: number;
  maxStorageGB: number;
  isActive: boolean;
  stripePriceId?: string;
  features: Feature[];
  tenants?: number; // Tenant objects
}

export interface PlanFeatures {
  [key: string]: boolean;
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxUsers: number;
  maxProjects: number;
  maxStorageGB: number;
  isActive?: boolean;
  featureIds: number[];
}

export interface UpdateSubscriptionPlanRequest {
  id: number;
  name?: string;
  description?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  maxUsers?: number;
  maxProjects?: number;
  maxStorageGB?: number;
  isActive?: boolean;
  featureIds?: number[];
  stripePriceId?: string;
}

export interface SubscriptionStats {
  totalPlans: number;
  activePlans: number;
  totalSubscribers: number;
  monthlyRevenue: number;
} 