import { Role } from "./roleModel";

export type User = {
  id: string;
  userName: string;
  name: string;
  email: string;
  avatar?: string;
  roles: Role[];
  standardRate: number;
  isConsultant: boolean;
}

export interface AuthUser extends User {
  userName: string;
  password: string; // Note: In a real app, passwords should be hashed
  roles: Role[];
}
