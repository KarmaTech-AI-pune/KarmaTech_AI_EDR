import { ProjectStatus } from '../types/index';

export type { GoNoGoDecision } from './goNoGoDecisionModel';
export type { OpportunityTracking } from './opportunityTrackingModel';

export {
    GoNoGoStatus,
    TypeOfBid,
    WorkflowStatus,
    GoNoGoVersionStatus
} from './types';

export interface User {
    id: string;
    userName: string;
    name: string;
    email: string;
    roles: Role[];
    standardRate: number;
    isConsultant: boolean;
    createdAt: string;
    avatar?: string;
    lastLogin?: string | null;
    password?: string;
    tenantId?: number;
    tenantDomain?: string;
    twoFactorEnabled?: boolean;
}

export interface Role {
    id: string;
    name: string;
    permissions: string[];
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    projectNo: string;
    typeOfJob: string;
    sector: string;
    priority: string;
    clientName: string;
    typeOfClient: string;
    region: string;
    office: string;
    currency: string;
    estimatedProjectFee: number;
    startDate?: string;
    endDate?: string;
    details: string;
    createdAt: string;
    updatedAt: string;
    seniorProjectManagerId: string;
    regionalManagerId: string;
    projectManagerId: string;
    estimatedProjectCost: number;
    letterOfAcceptance: boolean;
    opportunityTrackingId: number;   
    feeType:string; 
    percentage?: number;
}

export interface OpportunityHistory {
    opportunityId: number;
    date: string;
    description: string;
    id: number;
    statusId: number;
    status: string;
    action: string;
    assignedToId: string;
}

// OpportunityTracking is now imported from './opportunityTrackingModel'

export enum PermissionType {
    VIEW_PROJECT = 'VIEW_PROJECT',
    CREATE_PROJECT = 'CREATE_PROJECT',
    EDIT_PROJECT = 'EDIT_PROJECT',
    DELETE_PROJECT = 'DELETE_PROJECT',
    REVIEW_PROJECT = 'REVIEW_PROJECT',
    APPROVE_PROJECT = 'APPROVE_PROJECT',
    SUBMIT_PROJECT_FOR_REVIEW = 'SUBMIT_PROJECT_FOR_REVIEW',
    SUBMIT_PROJECT_FOR_APPROVAL = 'SUBMIT_PROJECT_FOR_APPROVAL',

    CREATE_BUSINESS_DEVELOPMENT = 'CREATE_BUSINESS_DEVELOPMENT',
    EDIT_BUSINESS_DEVELOPMENT = 'EDIT_BUSINESS_DEVELOPMENT',
    DELETE_BUSINESS_DEVELOPMENT = 'DELETE_BUSINESS_DEVELOPMENT',
    VIEW_BUSINESS_DEVELOPMENT = 'VIEW_BUSINESS_DEVELOPMENT',
    REVIEW_BUSINESS_DEVELOPMENT = 'REVIEW_BUSINESS_DEVELOPMENT',
    APPROVE_BUSINESS_DEVELOPMENT = 'APPROVE_BUSINESS_DEVELOPMENT',
    //SUBMIT_FOR_REVIEW = 'SUBMIT_FOR_REVIEW',
    SUBMIT_FOR_APPROVAL = 'SUBMIT_FOR_APPROVAL',

    SYSTEM_ADMIN = 'SYSTEM_ADMIN',
    Tenant_ADMIN = 'Tenant_ADMIN',

}

export interface RoleDefinition {
    id: string;
    name: string;
    permissions: PermissionType[];
}

export type { WBSTask } from './wbsTaskModel';
export type { WBSTaskResourceAllocation } from './wbsTaskResourceAllocationModel';
export type { PlannedHour } from './plannedHourModel';
export type { resourceRole } from './resourceRoleModel';
export type { Employee } from './employeeModel';
export type { CheckReviewRow } from './checkReviewModel';
export type { ChangeControl } from './changeControlModel';
export type { InwardRow } from './inwardRowModel';
export type { OutwardRow } from './outwardRowModel';
export type { ProjectClosureRow } from './projectClosureRowModel';
export type { WorkflowHistory } from './projectClosureRowModel';
export type { ProjectClosureComment } from './projectClosureCommentModel';
export type { InputRegisterRow } from './inputRegisterRowModel';
