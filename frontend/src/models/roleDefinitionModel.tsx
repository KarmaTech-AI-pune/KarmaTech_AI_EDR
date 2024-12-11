import { PermissionType } from ".";

export interface RoleDefinition {
    id: string;
    name: string;
    permissions: PermissionType[];
  }