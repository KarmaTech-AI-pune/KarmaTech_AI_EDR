import { PermissionType } from '../models';

export interface EnhancedUserWithRole {
  id: string;
  userName: string;
  name: string;
  email: string;
  avatar?: string;
  roles: Role[];
  roleDetails: RoleDetails;
  standardRate: number;
  isConsultant: boolean;
  createdAt: string;
  // Enhanced properties for multi-tenant support
  isSuperAdmin?: boolean;
  userType?: 'SuperAdmin' | 'TenantUser';
  tenantRole?: 'Owner' | 'Admin' | 'Manager' | 'User';
  tenantContext?: string;
  tenantId?: number;
}

export interface Role {
  id: string;
  name: string;
  permissions: PermissionType[];
}

export interface RoleDetails {
  id: string;
  name: string;
  permissions: PermissionType[];
}

export interface EnhancedLoginResponse {
  success: boolean;
  user?: EnhancedUserWithRole;
  token?: string;
  message: string;
  userType?: 'SuperAdmin' | 'TenantUser';
  tenantContext?: string;
}

export interface TenantContext {
  tenantId: number;
  tenantName: string;
  tenantDomain: string;
  tenantRole: string;
  isActive: boolean;
}

export interface SuperAdminContext {
  isSuperAdmin: boolean;
  canManageTenants: boolean;
  canManageSystem: boolean;
  canAccessAllData: boolean;
}

export interface AuthContext {
  user: EnhancedUserWithRole | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  tenantContext: TenantContext | null;
  superAdminContext: SuperAdminContext | null;
  login: (credentials: Credentials, tenantContext?: string) => Promise<EnhancedLoginResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface TenantUser {
  id: number;
  tenantId: number;
  userId: string;
  role: TenantUserRole;
  joinedAt: string;
  isActive: boolean;
  user?: EnhancedUserWithRole;
}

export enum TenantUserRole {
  Owner = 0,
  Admin = 1,
  Manager = 2,
  User = 3
}

export interface TenantInfo {
  id: number;
  name: string;
  domain: string;
  status: TenantStatus;
  maxUsers: number;
  maxProjects: number;
  subscriptionPlan?: SubscriptionPlan;
}

export enum TenantStatus {
  Active = 0,
  Suspended = 1,
  Cancelled = 2,
  Trial = 3,
  Expired = 4
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  billingCycle: number;
  maxUsers: number;
  maxProjects: number;
  features: string[];
} 