import { PermissionType } from '../models/permissionTypeModel';
import { Project, OpportunityTracking } from '../models';
import { GoNoGoDecision } from '../models/goNoGoDecisionModel';

export interface Credentials {
  username: string;
  password: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: PermissionType[];
}

export interface UserRole {
  name: string;
}

export interface User {
  id: string;
  userName: string;
  name: string;
  email: string;
  avatar?: string;
  roles: Role[];
}

export interface UserWithRole extends User {
  roleDetails: Role;
}

export type projectManagementAppContextType = {
  screenState: string;
  setScreenState: (state: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (state: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  handleLogout: () => void;
  currentUser: UserWithRole | null;
  setCurrentUser: (user: UserWithRole | null) => void;
  canEditOpportunity: boolean;
  setCanEditOpportunity: (state: boolean) => void;
  canDeleteOpportunity: boolean;
  setCanDeleteOpportunity: (state: boolean) => void;
  canSubmitForReview: boolean;
  setCanSubmitForReview: (state: boolean) => void;
  canReviewBD: boolean;
  setCanReviewBD: (state: boolean) => void;
  canApproveBD: boolean;
  setCanApproveBD: (state: boolean) => void;
  canSubmitForApproval: boolean;
  setCanSubmitForApproval: (state: boolean) => void;
  selectedProject: Project | OpportunityTracking | null;
  setSelectedProject: (project: Project | OpportunityTracking | null) => void;
  currentGoNoGoDecision: GoNoGoDecision | null;
  setCurrentGoNoGoDecision: (decision: GoNoGoDecision | null) => void;
};

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserWithRole;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

// Helper function to convert string permissions to PermissionType
export const mapStringToPermissionType = (permission: string): PermissionType | null => {
  const permissionKey = Object.keys(PermissionType).find(
    key => PermissionType[key as keyof typeof PermissionType] === permission
  );
  return permissionKey ? PermissionType[permissionKey as keyof typeof PermissionType] : null;
};
