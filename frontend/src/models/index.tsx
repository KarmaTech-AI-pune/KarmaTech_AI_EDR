export { GoNoGoStatus } from './goNoGoDecisionModel';

export interface User {
    id: string;
    userName: string;
    name: string;
    email: string;
    roles: Role[];
    standardRate: number;
    isConsultant: boolean;
    createdAt: string;
    lastLogin: string | null;
    password?: string;
}

export interface Role {
    id: string;
    name: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OpportunityTracking {
    id: number;
    name: string;
    description?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

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
    SUBMIT_FOR_REVIEW = 'SUBMIT_FOR_REVIEW',
    SUBMIT_FOR_APPROVAL = 'SUBMIT_FOR_APPROVAL',

    SYSTEM_ADMIN = 'SYSTEM_ADMIN'
}

export interface RoleDefinition {
    id: string;
    name: string;
    permissions: PermissionType[];
}

export enum TypeOfBid {
    Lumpsum = 0,
    ItemRate = 1
}
