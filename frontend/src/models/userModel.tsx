import { UserRole } from ".";
export type User = {
    id: string;
    userName: string;
    name: string;
    email: string;
    avatar?: string;
    roles: UserRole[];
    standardRate: number;
    isConsultant: boolean;
  }

  export interface AuthUser extends User {
    userName: string;
    password: string; // Note: In a real app, passwords should be hashed
    roles: UserRole[];
  }

  /*
  export enum UserRole {
    Admin = 'Admin', //Admin
    ProjectManager = 'Project Manager', //PM
    SeniorProjectManager = 'Senior Project Manager', //SPM
    RegionalManager = 'Regional Manager', //RM
    BusinessDevelopmentManager = 'Business Development Manager', //BDM
    RegionalDirector = 'Regional Director',
    SubjectMatterExpert = 'Subject Matter Expert',
  }*/
