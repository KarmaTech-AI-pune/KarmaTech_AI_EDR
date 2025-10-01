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
  features: PlanFeatures;
  tenants?: any[]; // Tenant objects
}

export interface PlanFeatures {
  advancedReporting: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
  sso: boolean;
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
  features: PlanFeatures;
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
  features?: PlanFeatures;
}

export interface SubscriptionStats {
  totalPlans: number;
  activePlans: number;
  totalSubscribers: number;
  monthlyRevenue: number;
} 