import { Role } from "./roleModel";

export type User = {
  id: string;
  userName: string;
  name: string;
  email: string;
  avatar?: string;
  standardRate: number;
  isConsultant: boolean;
  createdAt: string;
  roles: Role[];
};

export interface AuthUser extends User {
  userName: string;
  password: string; // Note: In a real app, passwords should be hashed
  roles: Role[];
}
