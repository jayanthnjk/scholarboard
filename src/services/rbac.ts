/**
 * Role-Based Access Control (RBAC) Permission Engine.
 * Implements role hierarchy, permission resolution, data scoping,
 * custom roles, and privilege escalation prevention.
 * @see Requirements 2.1, 2.6, 2.7, 2.8, 2.11, 2.13
 */

import {
  ROLE_HIERARCHY,
  MAX_CUSTOM_ROLES_PER_TENANT,
  type BuiltInRole,
  type Role,
  type Permission,
  type ActionPermission,
  type DataScope,
  type PermissionCheckResult,
  type CustomRoleRequest,
  type PrivilegeEscalationCheck,
} from '@/types/rbac';

/** All built-in roles in hierarchy order (highest privilege first) */
const BUILT_IN_ROLES: readonly BuiltInRole[] = [
  'super_admin',
  'school_admin',
  'accountant',
  'teacher',
  'staff',
  'parent',
  'student',
];

/**
 * Default permissions for each built-in role.
 * Higher roles inherit all permissions of lower roles.
 */
const DEFAULT_ROLE_PERMISSIONS: Readonly<Record<BuiltInRole, readonly Permission[]>> = {
  super_admin: [
    { resource: '*', level: 'module', actions: ['view', 'edit', 'delete', 'export', 'create', 'approve', 'assign'] },
  ],
  school_admin: [
    { resource: '*', level: 'module', actions: ['view', 'edit', 'delete', 'export', 'create', 'approve'] },
  ],
  accountant: [
    { resource: 'finance', level: 'module', actions: ['view', 'edit', 'create', 'export'] },
    { resource: 'fees', level: 'module', actions: ['view', 'edit', 'create', 'approve', 'collect'] },
    { resource: 'payments', level: 'page', actions: ['view', 'edit', 'create'] },
    { resource: 'reports', level: 'module', actions: ['view', 'export'] },
    { resource: 'students', level: 'module', actions: ['view'] },
  ],
  teacher: [
    { resource: 'academics', level: 'module', actions: ['view', 'edit'] },
    { resource: 'students', level: 'module', actions: ['view'] },
    { resource: 'attendance', level: 'module', actions: ['view', 'edit', 'create'] },
    { resource: 'exams', level: 'module', actions: ['view', 'edit', 'create'] },
    { resource: 'timetable', level: 'module', actions: ['view'] },
    { resource: 'communication', level: 'module', actions: ['view', 'create'] },
    { resource: 'library', level: 'module', actions: ['view'] },
  ],
  staff: [
    { resource: 'students', level: 'module', actions: ['view'] },
    { resource: 'communication', level: 'module', actions: ['view'] },
    { resource: 'attendance', level: 'module', actions: ['view'] },
    { resource: 'fees', level: 'module', actions: ['view'] },
    { resource: 'library', level: 'module', actions: ['view'] },
  ],
  parent: [
    { resource: 'students', level: 'module', actions: ['view'] },
    { resource: 'fees', level: 'module', actions: ['view'] },
    { resource: 'attendance', level: 'module', actions: ['view'] },
    { resource: 'exams', level: 'module', actions: ['view'] },
    { resource: 'communication', level: 'module', actions: ['view'] },
  ],
  student: [
    { resource: 'academics', level: 'module', actions: ['view'] },
    { resource: 'attendance', level: 'module', actions: ['view'] },
    { resource: 'exams', level: 'module', actions: ['view'] },
    { resource: 'fees', level: 'module', actions: ['view'] },
    { resource: 'timetable', level: 'module', actions: ['view'] },
    { resource: 'library', level: 'module', actions: ['view'] },
  ],
};

/**
 * RBAC Engine providing permission resolution with role hierarchy.
 */
class RBACEngine {
  private customRoles: Map<string, Role> = new Map();

  /**
   * Check if a role has a specific permission on a resource.
   * Resolves through role hierarchy (higher roles inherit lower).
   */
  hasPermission(
    role: string,
    resource: string,
    action: ActionPermission,
    scope?: DataScope,
  ): PermissionCheckResult {
    // Super admin has all permissions
    if (role === 'super_admin') {
      return { granted: true };
    }

    const permissions = this.resolvePermissions(role);
    const hasAccess = this.checkPermissionMatch(permissions, resource, action, scope);

    if (hasAccess) {
      return { granted: true };
    }

    return {
      granted: false,
      reason: `Role "${role}" does not have "${action}" permission on "${resource}"`,
      requiredPermission: `${resource}.${action}`,
      currentRole: role,
    };
  }

  /**
   * Check if a role has access to a module.
   */
  hasModuleAccess(role: string, moduleId: string): boolean {
    if (role === 'super_admin') return true;

    const permissions = this.resolvePermissions(role);
    return permissions.some(
      (p) =>
        p.level === 'module' &&
        (p.resource === moduleId || p.resource === '*'),
    );
  }

  /**
   * Check if a role has access to a specific page.
   */
  hasPageAccess(role: string, pageId: string): boolean {
    if (role === 'super_admin') return true;

    const permissions = this.resolvePermissions(role);
    return permissions.some(
      (p) =>
        (p.level === 'page' || p.level === 'module') &&
        (p.resource === pageId || p.resource === '*'),
    );
  }

  /**
   * Resolve all effective permissions for a role, including inherited ones.
   */
  resolvePermissions(role: string): readonly Permission[] {
    // Check if it's a custom role
    const customRole = this.customRoles.get(role);
    if (customRole) {
      return this.resolveCustomRolePermissions(customRole);
    }

    // Built-in role: collect own + inherited permissions
    const builtInRole = role as BuiltInRole;
    if (!(builtInRole in ROLE_HIERARCHY)) {
      return [];
    }

    const hierarchy = ROLE_HIERARCHY[builtInRole];
    const allPermissions: Permission[] = [];

    // Collect permissions from current role and all lower roles
    for (const [roleName, level] of Object.entries(ROLE_HIERARCHY)) {
      if (level >= hierarchy) {
        const rolePerms = DEFAULT_ROLE_PERMISSIONS[roleName as BuiltInRole];
        if (rolePerms) {
          allPermissions.push(...rolePerms);
        }
      }
    }

    return this.deduplicatePermissions(allPermissions);
  }

  /**
   * Get the hierarchy level of a role (lower = more privileged).
   */
  getRoleLevel(role: string): number {
    const customRole = this.customRoles.get(role);
    if (customRole) return customRole.hierarchy;

    const builtInRole = role as BuiltInRole;
    return ROLE_HIERARCHY[builtInRole] ?? 999;
  }

  /**
   * Check if roleA outranks roleB in the hierarchy.
   */
  isHigherRole(roleA: string, roleB: string): boolean {
    return this.getRoleLevel(roleA) < this.getRoleLevel(roleB);
  }

  /**
   * Register a custom role for a tenant.
   * Validates against MAX_CUSTOM_ROLES_PER_TENANT.
   */
  registerCustomRole(
    tenantId: string,
    request: CustomRoleRequest,
    creatorRole: string,
  ): Role | { error: string } {
    // Check custom role limit
    const tenantCustomRoles = Array.from(this.customRoles.values()).filter(
      (r) => r.tenantId === tenantId,
    );
    if (tenantCustomRoles.length >= MAX_CUSTOM_ROLES_PER_TENANT) {
      return { error: `Maximum ${MAX_CUSTOM_ROLES_PER_TENANT} custom roles per tenant reached` };
    }

    // Check privilege escalation
    const escalationCheck = this.checkPrivilegeEscalation(request.permissions, creatorRole);
    if (!escalationCheck.safe) {
      return { error: 'Privilege escalation detected: role would have more permissions than creator' };
    }

    // Determine hierarchy level
    let hierarchyLevel: number;
    if (request.inheritsFrom) {
      const parentLevel = this.getRoleLevel(request.inheritsFrom);
      hierarchyLevel = parentLevel + 0.5; // Between parent and next lower
    } else {
      hierarchyLevel = ROLE_HIERARCHY.staff; // Default to staff level
    }

    const role: Role = {
      id: `custom_${tenantId}_${Date.now()}`,
      name: request.name,
      type: 'custom',
      hierarchy: hierarchyLevel,
      permissions: request.permissions,
      inheritsFrom: request.inheritsFrom,
      tenantId,
      description: request.description,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.customRoles.set(role.id, role);
    return role;
  }

  /**
   * Remove a custom role.
   */
  removeCustomRole(roleId: string): boolean {
    return this.customRoles.delete(roleId);
  }

  /**
   * Check for privilege escalation.
   * A user cannot create a role with more permissions than their own.
   */
  checkPrivilegeEscalation(
    requestedPermissions: readonly Permission[],
    creatorRole: string,
  ): PrivilegeEscalationCheck {
    // Super admin can create any role
    if (creatorRole === 'super_admin') {
      return { safe: true };
    }

    const creatorPermissions = this.resolvePermissions(creatorRole);
    const escalatedPermissions: Permission[] = [];

    for (const requested of requestedPermissions) {
      const creatorHasIt = this.checkPermissionMatch(
        creatorPermissions,
        requested.resource,
        requested.actions[0] ?? 'view',
      );
      if (!creatorHasIt) {
        escalatedPermissions.push(requested);
      }
    }

    if (escalatedPermissions.length > 0) {
      return { safe: false, escalatedPermissions };
    }

    return { safe: true };
  }

  /**
   * Get all built-in roles.
   */
  getBuiltInRoles(): readonly BuiltInRole[] {
    return BUILT_IN_ROLES;
  }

  /**
   * Get custom roles for a specific tenant.
   */
  getCustomRoles(tenantId: string): readonly Role[] {
    return Array.from(this.customRoles.values()).filter(
      (r) => r.tenantId === tenantId && r.isActive,
    );
  }

  /**
   * Check if a user with given scope can access data in target scope.
   */
  checkDataScope(userScope: DataScope | undefined, targetScope: DataScope | undefined): boolean {
    // No scope restrictions
    if (!userScope) return true;
    if (!targetScope) return true;

    // Check class scope
    if (userScope.classes && targetScope.classes) {
      const hasClassAccess = targetScope.classes.some((c) =>
        userScope.classes?.includes(c),
      );
      if (!hasClassAccess) return false;
    }

    // Check section scope
    if (userScope.sections && targetScope.sections) {
      const hasSectionAccess = targetScope.sections.some((s) =>
        userScope.sections?.includes(s),
      );
      if (!hasSectionAccess) return false;
    }

    // Check department scope
    if (userScope.departments && targetScope.departments) {
      const hasDeptAccess = targetScope.departments.some((d) =>
        userScope.departments?.includes(d),
      );
      if (!hasDeptAccess) return false;
    }

    // Check grade scope
    if (userScope.grades && targetScope.grades) {
      const hasGradeAccess = targetScope.grades.some((g) =>
        userScope.grades?.includes(g),
      );
      if (!hasGradeAccess) return false;
    }

    return true;
  }

  // === Private Methods ===

  private checkPermissionMatch(
    permissions: readonly Permission[],
    resource: string,
    action: ActionPermission,
    _scope?: DataScope,
  ): boolean {
    return permissions.some((perm) => {
      // Wildcard resource
      if (perm.resource === '*') {
        return perm.actions.includes(action);
      }

      // Exact resource match
      if (perm.resource !== resource) return false;

      // Check action
      if (!perm.actions.includes(action)) return false;

      return true;
    });
  }

  private resolveCustomRolePermissions(role: Role): readonly Permission[] {
    const allPermissions: Permission[] = [...role.permissions];

    // Include inherited permissions
    if (role.inheritsFrom) {
      const inherited = this.resolvePermissions(role.inheritsFrom);
      allPermissions.push(...inherited);
    }

    return this.deduplicatePermissions(allPermissions);
  }

  private deduplicatePermissions(permissions: Permission[]): Permission[] {
    const map = new Map<string, Permission>();

    for (const perm of permissions) {
      const key = `${perm.resource}:${perm.level}`;
      const existing = map.get(key);
      if (existing) {
        // Merge actions
        const mergedActions = [...new Set([...existing.actions, ...perm.actions])] as ActionPermission[];
        map.set(key, { ...existing, actions: mergedActions });
      } else {
        map.set(key, perm);
      }
    }

    return Array.from(map.values());
  }
}

/** Singleton RBAC engine instance */
export const rbacEngine = new RBACEngine();

export { RBACEngine, BUILT_IN_ROLES, DEFAULT_ROLE_PERMISSIONS };
