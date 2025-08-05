import { SubscriptionPlan } from "./subscriptionModel";

export interface Tenant {
  id: number;
  name: string;
  domain: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: TenantStatus;
  createdAt: string;
  trialEndDate?: string;
  subscriptionEndDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionPlanId?: number;
  subscriptionPlan?: SubscriptionPlan;
  maxUsers: number;
  maxProjects: number;
  isActive: boolean;
  tenantUsers?: TenantUser[];
  tenantDatabases?: TenantDatabase[];
}

export enum TenantStatus {
  Active = 0,
  Suspended = 1,
  Cancelled = 2,
  Trial = 3,
  Expired = 4
}

export interface TenantUser {
  id: number;
  tenantId: number;
  userId: string;
  role: TenantUserRole;
  joinedAt: string;
  isActive: boolean;
  user?: any; // User object
}

export enum TenantUserRole {
  Owner = 0,
  Admin = 1,
  Manager = 2,
  User = 3
}

export interface TenantDatabase {
  id: number;
  tenantId: number;
  databaseName: string;
  connectionString?: string;
  status: DatabaseStatus;
  createdAt: string;
  lastBackup?: string;
}

export enum DatabaseStatus {
  Active = 'Active',
  Provisioning = 'Provisioning',
  Suspended = 'Suspended',
  Deleted = 'Deleted'
}

export interface CreateTenantRequest {
  name: string;
  domain: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  subscriptionPlanId?: number;
  maxUsers?: number;
  maxProjects?: number;
  status?: TenantStatus;
}

export interface UpdateTenantRequest {
  id: number;
  name?: string;
  domain?: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  subscriptionPlanId?: number;
  maxUsers?: number;
  maxProjects?: number;
  status?: TenantStatus;
  isActive?: boolean;
} 