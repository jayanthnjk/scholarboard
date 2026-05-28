/**
 * Role-Based Access Control types.
 * Supports 7 built-in roles with hierarchy, custom roles, and data-scoped permissions.
 * @see Requirements 2.1, 2.6, 2.7, 2.8, 2.11, 2.13
 */

/**
 * Built-in roles in hierarchy order from highest to lowest privilege.
 * Higher roles inherit all permissions of roles below them.
 */
export type BuiltInRole =
  | 'super_admin'
  | 'school_admin'
  | 'accountant'
  | 'teacher'
  | 'staff'
  | 'parent'
  | 'student';

/**
 * Hierarchy level mapping for built-in roles.
 * Lower number = more privileged.
 */
export const ROLE_HIERARCHY: Readonly<Record<BuiltInRole, number>> = {
  super_admin: 0,
  school_admin: 1,
  accountant: 2,
  teacher: 3,
  staff: 4,
  parent: 5,
  student: 6,
} as const;

/** Maximum number of custom roles allowed per tenant */
export const MAX_CUSTOM_ROLES_PER_TENANT = 20;

/** Permission enforcement levels */
export type PermissionLevel = 'module' | 'page' | 'action';

/** Available action-level permissions */
export type ActionPermission =
  | 'view'
  | 'edit'
  | 'delete'
  | 'export'
  | 'create'
  | 'approve'
  | 'assign'
  | 'collect'
  | 'refund';

/**
 * Data scope restricting access to specific organizational units.
 * E.g., a Teacher can only view students in assigned classes.
 */
export interface DataScope {
  readonly classes?: readonly string[];
  readonly sections?: readonly string[];
  readonly departments?: readonly string[];
  readonly grades?: readonly string[];
}

/**
 * A single permission entry defining access to a resource.
 * Permissions are resolved at module, page, and action levels.
 */
export interface Permission {
  readonly resource: string;
  readonly level: PermissionLevel;
  readonly actions: readonly ActionPermission[];
  readonly scope?: DataScope;
}

/** Discriminated union for role type */
export type RoleType = 'built_in' | 'custom';

/**
 * Role definition with hierarchy and permissions.
 * Built-in roles form a strict hierarchy; custom roles are tenant-specific.
 */
export interface Role {
  readonly id: string;
  readonly name: string;
  readonly type: RoleType;
  readonly hierarchy: number;
  readonly permissions: readonly Permission[];
  readonly inheritsFrom?: string;
  readonly tenantId?: string;
  readonly description?: string;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Return type for the usePermission() hook.
 * Provides permission checking utilities for the current user.
 */
export interface UsePermissionReturn {
  readonly hasPermission: (resource: string, action: ActionPermission) => boolean;
  readonly hasModuleAccess: (moduleId: string) => boolean;
  readonly hasPageAccess: (pageId: string) => boolean;
  readonly permissions: readonly Permission[];
  readonly role: Role;
  readonly isImpersonating: boolean;
}

/**
 * Props for the withPermission() higher-order component.
 * Conditionally renders components based on permission checks.
 */
export interface WithPermissionProps {
  readonly resource: string;
  readonly action: ActionPermission;
  readonly fallback?: React.ReactNode;
  /** If true, shows disabled element with tooltip instead of hiding */
  readonly disableMode?: boolean;
}

/**
 * Permission check result with reason for denial.
 * Used for displaying informative messages to users.
 */
export type PermissionCheckResult =
  | { readonly granted: true }
  | {
      readonly granted: false;
      readonly reason: string;
      readonly requiredPermission: string;
      readonly currentRole: string;
    };

/**
 * Custom role creation/modification request.
 * Enforces privilege escalation prevention: resulting role's permissions
 * must be a subset of the creator's permissions.
 */
export interface CustomRoleRequest {
  readonly name: string;
  readonly description?: string;
  readonly permissions: readonly Permission[];
  readonly inheritsFrom?: string;
}

/**
 * Result of privilege escalation check.
 * Prevents School_Admin from creating roles exceeding their own permissions.
 */
export type PrivilegeEscalationCheck =
  | { readonly safe: true }
  | {
      readonly safe: false;
      readonly escalatedPermissions: readonly Permission[];
    };
