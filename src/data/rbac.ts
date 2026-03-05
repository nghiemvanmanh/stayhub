import {
  Resource,
  Permission,
  RoleResourcePermission,
} from "../interfaces/rbac";

export const mockResources: Resource[] = [
  { id: 1, code: "USERS", name: "User Management" },
  { id: 2, code: "PROPERTIES", name: "Property Management" },
  { id: 3, code: "BOOKINGS", name: "Booking Management" },
];

export const mockPermissions: Permission[] = [
  { id: 1, code: "CREATE", name: "Create" },
  { id: 2, code: "READ", name: "Read" },
  { id: 3, code: "UPDATE", name: "Update" },
  { id: 4, code: "DELETE", name: "Delete" },
];

export const mockRoleResourcePermissions: RoleResourcePermission[] = [
  { id: 1, roleId: 1, resourceId: 1, permissionId: 1 }, // Admin can create users
  { id: 2, roleId: 1, resourceId: 1, permissionId: 2 }, // Admin can read users
  { id: 3, roleId: 1, resourceId: 1, permissionId: 3 }, // Admin can update users
  { id: 4, roleId: 1, resourceId: 1, permissionId: 4 }, // Admin can delete users
  { id: 5, roleId: 2, resourceId: 2, permissionId: 1 }, // Host can create properties
  { id: 6, roleId: 2, resourceId: 2, permissionId: 2 }, // Host can read properties
  { id: 7, roleId: 2, resourceId: 2, permissionId: 3 }, // Host can update properties
  { id: 8, roleId: 3, resourceId: 2, permissionId: 2 }, // Guest can read properties
];
