export interface RoleConfig {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  sidebarPermissions: string[];
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleConfigPayload {
  name: string;
  displayName: string;
  description?: string;
  sidebarPermissions?: string[];
  priority?: number;
}

export interface UpdateRoleConfigPayload extends Partial<CreateRoleConfigPayload> {}
