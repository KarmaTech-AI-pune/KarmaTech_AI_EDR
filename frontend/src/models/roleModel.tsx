import { PermissionType } from './index';

export type Role = {
  id: string;
  name: string;
  permissions: PermissionType[];
}
