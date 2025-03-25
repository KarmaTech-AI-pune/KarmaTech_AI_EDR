import { ReactElement } from 'react';
import { User } from './models';
import { GoNoGoDecision } from './models/goNoGoDecisionModel';
import { Project, OpportunityTracking } from './models';

export interface screensArrayType {
    [key: string]: ReactElement | null;
}

export interface UserWithRole extends User {
    roleDetails?: {
        id: string;
        name: string;
        permissions: string[];
    } | null;
}

export interface projectManagementAppContextType {
    screenState: string;
    setScreenState: (state: string) => void;
    isAuthenticated: boolean;
    setIsAuthenticated: (auth: boolean) => void;
    user: User | null;
    setUser: (user: User | null) => void;
    handleLogout: () => void;
    selectedProject: Project | OpportunityTracking | null;
    setSelectedProject: (project: Project | OpportunityTracking | null) => void;
    currentGoNoGoDecision: GoNoGoDecision | null;
    setCurrentGoNoGoDecision: (decision: GoNoGoDecision | null) => void;
    goNoGoDecisionStatus: string | null;
    setGoNoGoDecisionStatus: (status: string | null) => void;
    goNoGoVersionNumber: number | null;
    setGoNoGoVersionNumber: (versionNumber: number | null) => void;
    currentUser: UserWithRole | null;
    setCurrentUser: (user: UserWithRole | null) => void;
    canEditOpportunity: boolean;
    setCanEditOpportunity: (can: boolean) => void;
    canDeleteOpportunity: boolean;
    setCanDeleteOpportunity: (can: boolean) => void;
    canSubmitForReview: boolean;
    setCanSubmitForReview: (can: boolean) => void;
    canReviewBD: boolean;
    setCanReviewBD: (can: boolean) => void;
    canApproveBD: boolean;
    setCanApproveBD: (can: boolean) => void;
    canSubmitForApproval: boolean;
    setCanSubmitForApproval: (can: boolean) => void;
}

export interface Credentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    user?: UserWithRole;
    token?: string;
    message?: string;
}

export interface OpportunityItemProps {
    opportunity: OpportunityTracking;
    onOpportunityDeleted?: (id: string) => void;
    onOpportunityUpdated?: (updatedOpportunity?: OpportunityTracking) => void;
}
