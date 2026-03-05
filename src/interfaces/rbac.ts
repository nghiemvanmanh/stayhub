export interface Resource {
  id: string | number;
  code: string;
  name: string;
}

export interface Permission {
  id: string | number;
  code: string;
  name: string;
}

export interface RoleResourcePermission {
  id: string | number;
  roleId: string | number;
  resourceId: string | number;
  permissionId: string | number;
}
