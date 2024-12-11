import { UserRole } from "./userRoleModel";

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
  }

  export interface AuthUser extends User {
    username: string;
    password: string; // Note: In a real app, passwords should be hashed
    role: UserRole;
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