/**
 * Permission hook for checking user access to resources, modules, and pages.
 * Integrates with the RBAC engine and auth context.
 * @see Requirements 2.1, 2.6, 2.7
 */

import { useCallback, useMemo } from 'react';
import { useAppStore } from '@/store';
import { rbacEngine } from '@/services/rbac';
import type { ActionPermission, Permission, Role, UsePermissionReturn } from '@/types/rbac';

/**
 * Hook providing permission-checking utilities for the current user.
 * Reads role and permissions from the auth store, supporting impersonation.
 *
 * @returns Permission checking functions and current user's role info
 *
 * @example
 * ```tsx
 * const { hasPermission, hasModuleAccess } = usePermission();
 * if (hasPermission('students', 'edit')) { ... }
 * ```
 */
export function usePermission(): UsePermissionReturn {
  const user = useAppStore((s) => s.auth.user);
  const isImpersonating = useAppStore((s) => s.auth.isImpersonating);
  const impersonatedRole = useAppStore((s) => s.auth.impersonatedRole);

  // Use impersonated role if active, otherwise user's actual role
  const effectiveRole = isImpersonating && impersonatedRole
    ? impersonatedRole
    : (user?.role ?? 'student');

  const permissions = useMemo<readonly Permission[]>(() => {
    return rbacEngine.resolvePermissions(effectiveRole);
  }, [effectiveRole]);

  const role = useMemo<Role>(() => ({
    id: effectiveRole,
    name: effectiveRole,
    type: effectiveRole in { super_admin: 1, school_admin: 1, accountant: 1, teacher: 1, staff: 1, parent: 1, student: 1 }
      ? 'built_in'
      : 'custom',
    hierarchy: rbacEngine.getRoleLevel(effectiveRole),
    permissions,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  }), [effectiveRole, permissions]);

  /**
   * Check if the current user has a specific action permission on a resource.
   */
  const hasPermission = useCallback(
    (resource: string, action: ActionPermission): boolean => {
      const result = rbacEngine.hasPermission(effectiveRole, resource, action);
      return result.granted;
    },
    [effectiveRole],
  );

  /**
   * Check if the current user has access to a module.
   */
  const hasModuleAccess = useCallback(
    (moduleId: string): boolean => {
      return rbacEngine.hasModuleAccess(effectiveRole, moduleId);
    },
    [effectiveRole],
  );

  /**
   * Check if the current user has access to a specific page.
   */
  const hasPageAccess = useCallback(
    (pageId: string): boolean => {
      return rbacEngine.hasPageAccess(effectiveRole, pageId);
    },
    [effectiveRole],
  );

  return useMemo<UsePermissionReturn>(
    () => ({
      hasPermission,
      hasModuleAccess,
      hasPageAccess,
      permissions,
      role,
      isImpersonating,
    }),
    [hasPermission, hasModuleAccess, hasPageAccess, permissions, role, isImpersonating],
  );
}
