export type User = {
    id: number;
    userName: string;
    name: string;
    email: string;
    avatar?: string;
    roles: [];
  }

  export interface AuthUser extends User {
    userName: string;
    password: string; // Note: In a real app, passwords should be hashed
    roles: [];
  }
  export interface Role{
    id:string,
    name:string;
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