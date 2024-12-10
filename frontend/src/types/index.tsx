// File: frontend/src/types/index.ts
// Purpose: typescript types
import { Project, OpportunityTracking, GoNoGoDecision } from '../models';
import { UserRole } from '../dummyapi/database/dummyusers';
import { PermissionType } from '../dummyapi/database/dummyRoles';

export type screensArrayType = {
    [key : string] : JSX.Element
}

export type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export type Role = {
  id: string;
  name: string;
  permissions: PermissionType[];
}

export type UserWithRole = User & {
  roleDetails: Role;
}

export type projectManagementAppContextType  = {
    screenState: string,
    setScreenState: React.Dispatch<React.SetStateAction<string>>,
    isAuthenticated: boolean,
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    handleLogout: () => void;
    selectedProject?: Project | OpportunityTracking | null;
    setSelectedProject?: React.Dispatch<React.SetStateAction<Project | OpportunityTracking | null>>;
    currentGoNoGoDecision: GoNoGoDecision | null;
    setCurrentGoNoGoDecision: React.Dispatch<React.SetStateAction<GoNoGoDecision | null>>;
    currentUser: UserWithRole | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<UserWithRole | null>>;
    canEditOpportunity: boolean;
    setCanEditOpportunity : React.Dispatch<React.SetStateAction<boolean>>;
    canDeleteOpportunity: boolean;
    setCanDeleteOpportunity : React.Dispatch<React.SetStateAction<boolean>>;
    canSubmitForReview: boolean;
    setCanSubmitForReview : React.Dispatch<React.SetStateAction<boolean>>;
    canReviewBD: boolean;
    setCanReviewBD : React.Dispatch<React.SetStateAction<boolean>>;
    canApproveBD: boolean;
    setCanApproveBD : React.Dispatch<React.SetStateAction<boolean>>;
    canSubmitForApproval: boolean;
    setCanSubmitForApproval : React.Dispatch<React.SetStateAction<boolean>>;
}

export enum ProjectStatus {
  'Opportunity' = 0,
  'Decision Pending' = 1,
  'Cancelled' = 2,
  'Bid Submitted' = 3,
  'Bid Rejected' = 4,
  'Bid Accepted' = 5,
  'In Progress'  = 6,
  'Completed' = 7
}



export type ProjectFormData = Omit<Project, 'id'>;

export type ProjectItemProps = {
  project: Project;
  onProjectDeleted?: (projectId: number) => void;
  onProjectUpdated?: () => void;
}

export type ProjectFormType = {
  project?: ProjectFormData | Project;
  onSubmit: (data: ProjectFormData) => void;
  onCancel?: () => void;
}

export type Credentials = {
  username: string;
  password: string;
}

export type LoginResponse = {
  success: boolean;
  message: string;
  token?: string;
  user?: UserWithRole;
}


export type OpportunityItemProps = {
  opportunity: OpportunityTracking;
  onOpportunityDeleted?: (opportunityId: number) => void;
  onOpportunityUpdated?: () => void;
};

export type OpportunityFormData = Omit<OpportunityTracking, 'id'>;

export type OpportunityFormProps = {
  opportunity?: OpportunityTracking;
  onSubmit: (data: OpportunityFormData) => void;
  onCancel?: () => void;
};

// Optional: Create a type for creating a new Go/No-Go decision
export type CreateGoNoGoDecisionDto = Omit<GoNoGoDecision, 'id'> & { id?: number };

// Export types and enums related to roles
export type { 
  UserRole, 
  PermissionType 
};
