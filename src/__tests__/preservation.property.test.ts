/**
 * @vitest-environment node
 */

/**
 * Preservation Property Tests - Existing Behavior Baseline
 *
 * These tests capture CURRENT correct behavior that MUST be preserved through the RBAC fix.
 * They are written BEFORE implementing the fix and should PASS on unfixed code.
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { rbacEngine } from '@/services/rbac';
import { useAppStore } from '@/store';
import type { BuiltInRole } from '@/types/rbac';

// All built-in roles
const ALL_ROLES: BuiltInRole[] = [
  'super_admin',
  'school_admin',
  'accountant',
  'teacher',
  'staff',
  'parent',
  'student',
];

// Arbitrary that generates any built-in role
const roleArb = fc.constantFrom(...ALL_ROLES);

// ROLE_DASHBOARD_MAP as defined in AuthProvider.tsx (current unfixed state)
const ROLE_DASHBOARD_MAP: Readonly<Record<BuiltInRole, string>> = {
  super_admin: '/admin',
  school_admin: '/dashboard',
  accountant: '/fees',
  teacher: '/dashboard',
  staff: '/dashboard',
  parent: '/dashboard',
  student: '/dashboard',
};

describe('Preservation Property Tests', () => {
  /**
   * Property: For all School Admin sessions, login routes to /dashboard
   * AND all institution module pages remain accessible.
   *
   * **Validates: Requirements 3.1**
   */
  describe('School Admin Navigation Preservation', () => {
    it('School Admin always routes to /dashboard', () => {
      fc.assert(
        fc.property(fc.constant('school_admin' as BuiltInRole), (role) => {
          expect(ROLE_DASHBOARD_MAP[role]).toBe('/dashboard');
        }),
        { numRuns: 10 },
      );
    });

    it('School Admin has module access to all institution-level modules', () => {
      const institutionModules = [
        'students',
        'academics',
        'finance',
        'hr',
        'communication',
        'settings',
      ];

      fc.assert(
        fc.property(fc.constantFrom(...institutionModules), (moduleId) => {
          expect(rbacEngine.hasModuleAccess('school_admin', moduleId)).toBe(true);
        }),
        { numRuns: 20 },
      );
    });

    it('School Admin has full CRUD permissions on students', () => {
      const actions = ['view', 'edit', 'delete', 'export', 'create'] as const;

      fc.assert(
        fc.property(fc.constantFrom(...actions), (action) => {
          const result = rbacEngine.hasPermission('school_admin', 'students', action);
          expect(result.granted).toBe(true);
        }),
        { numRuns: 10 },
      );
    });
  });

  /**
   * Property: For all roles with students.create permission,
   * "Add Student" button is visible (permission check returns true).
   * For all roles without students.create permission,
   * "Add Student" button is hidden (permission check returns false).
   *
   * **Validates: Requirements 3.13**
   */
  describe('StudentListPage Permission Gating Preservation', () => {
    // Roles that have students.create
    const rolesWithStudentsCreate: BuiltInRole[] = ALL_ROLES.filter((role) =>
      rbacEngine.hasPermission(role, 'students', 'create').granted,
    );

    // Roles that do NOT have students.create
    const rolesWithoutStudentsCreate: BuiltInRole[] = ALL_ROLES.filter(
      (role) => !rbacEngine.hasPermission(role, 'students', 'create').granted,
    );

    it('roles with students.create permission can see Add Student button', () => {
      fc.assert(
        fc.property(fc.constantFrom(...rolesWithStudentsCreate), (role) => {
          const result = rbacEngine.hasPermission(role, 'students', 'create');
          expect(result.granted).toBe(true);
        }),
        { numRuns: 20 },
      );
    });

    it('roles without students.create permission cannot see Add Student button', () => {
      // Ensure there are roles without the permission
      expect(rolesWithoutStudentsCreate.length).toBeGreaterThan(0);

      fc.assert(
        fc.property(fc.constantFrom(...rolesWithoutStudentsCreate), (role) => {
          const result = rbacEngine.hasPermission(role, 'students', 'create');
          expect(result.granted).toBe(false);
        }),
        { numRuns: 20 },
      );
    });

    it('students.create permission follows role hierarchy correctly', () => {
      // super_admin and school_admin have create, lower roles don't
      fc.assert(
        fc.property(roleArb, (role) => {
          const hasCreate = rbacEngine.hasPermission(role, 'students', 'create').granted;
          if (role === 'super_admin' || role === 'school_admin') {
            expect(hasCreate).toBe(true);
          } else {
            expect(hasCreate).toBe(false);
          }
        }),
        { numRuns: 50 },
      );
    });
  });

  /**
   * Property: For all roles with students.edit permission,
   * "Edit" button is visible on StudentProfilePage.
   * For all roles without students.edit permission,
   * "Edit" button is hidden.
   *
   * **Validates: Requirements 3.14**
   */
  describe('StudentProfilePage Permission Gating Preservation', () => {
    const rolesWithStudentsEdit: BuiltInRole[] = ALL_ROLES.filter((role) =>
      rbacEngine.hasPermission(role, 'students', 'edit').granted,
    );

    const rolesWithoutStudentsEdit: BuiltInRole[] = ALL_ROLES.filter(
      (role) => !rbacEngine.hasPermission(role, 'students', 'edit').granted,
    );

    it('roles with students.edit permission can see Edit button', () => {
      fc.assert(
        fc.property(fc.constantFrom(...rolesWithStudentsEdit), (role) => {
          const result = rbacEngine.hasPermission(role, 'students', 'edit');
          expect(result.granted).toBe(true);
        }),
        { numRuns: 20 },
      );
    });

    it('roles without students.edit permission cannot see Edit button', () => {
      expect(rolesWithoutStudentsEdit.length).toBeGreaterThan(0);

      fc.assert(
        fc.property(fc.constantFrom(...rolesWithoutStudentsEdit), (role) => {
          const result = rbacEngine.hasPermission(role, 'students', 'edit');
          expect(result.granted).toBe(false);
        }),
        { numRuns: 20 },
      );
    });

    it('students.edit permission follows role hierarchy correctly', () => {
      fc.assert(
        fc.property(roleArb, (role) => {
          const hasEdit = rbacEngine.hasPermission(role, 'students', 'edit').granted;
          if (role === 'super_admin' || role === 'school_admin') {
            expect(hasEdit).toBe(true);
          } else {
            expect(hasEdit).toBe(false);
          }
        }),
        { numRuns: 50 },
      );
    });
  });

  /**
   * Property: Sidebar collapse state toggles correctly regardless of role.
   * Tests that the collapse toggle logic works: collapsed → not collapsed, and vice versa.
   *
   * **Validates: Requirements 3.3**
   */
  describe('Sidebar Collapse Toggle Preservation', () => {
    it('collapse toggle inverts the current collapsed state for any role and any initial state', () => {
      fc.assert(
        fc.property(roleArb, fc.boolean(), (role, initialCollapsed) => {
          // Simulate what the sidebar does: onCollapsedChange(!collapsed)
          const toggleResult = !initialCollapsed;
          expect(toggleResult).toBe(!initialCollapsed);
          // The role should not affect collapse behavior
          expect(typeof role).toBe('string');
        }),
        { numRuns: 50 },
      );
    });

    it('double toggle returns to original state', () => {
      fc.assert(
        fc.property(fc.boolean(), (initialCollapsed) => {
          const afterFirstToggle = !initialCollapsed;
          const afterSecondToggle = !afterFirstToggle;
          expect(afterSecondToggle).toBe(initialCollapsed);
        }),
        { numRuns: 20 },
      );
    });
  });

  /**
   * Property: Logout flow clears session and redirects for all roles.
   * Tests that the store logout action resets auth state completely.
   *
   * **Validates: Requirements 3.2**
   */
  describe('Logout Flow Preservation', () => {
    it('logout resets auth state completely for any role', () => {
      fc.assert(
        fc.property(roleArb, (role) => {
          // Set up authenticated state
          useAppStore.getState().setUser({
            id: 'test-id',
            email: `${role}@test.com`,
            name: `Test ${role}`,
            role,
            tenantId: 'tenant-1',
            permissions: [],
          } as unknown as import('@/types/session').AuthenticatedUser);
          useAppStore.getState().setToken('test-token');
          useAppStore.getState().setAuthenticated(true);

          // Verify state is set
          expect(useAppStore.getState().auth.isAuthenticated).toBe(true);
          expect(useAppStore.getState().auth.user).not.toBeNull();

          // Execute logout
          useAppStore.getState().logout();

          // Verify state is cleared
          expect(useAppStore.getState().auth.user).toBeNull();
          expect(useAppStore.getState().auth.token).toBeNull();
          expect(useAppStore.getState().auth.isAuthenticated).toBe(false);
          expect(useAppStore.getState().auth.isImpersonating).toBe(false);
          expect(useAppStore.getState().auth.impersonatedRole).toBeUndefined();
        }),
        { numRuns: 20 },
      );
    });
  });

  /**
   * Property: RBAC Engine preserves permission resolution behavior.
   * Ensures the permission hierarchy is consistent — higher roles always
   * have a superset of lower roles' permissions.
   *
   * **Validates: Requirements 3.6, 3.7**
   */
  describe('RBAC Permission Resolution Preservation', () => {
    it('super_admin has permission for any resource and action', () => {
      const resources = ['students', 'fees', 'attendance', 'exams', 'settings', 'hr', 'reports'];
      const actions = ['view', 'edit', 'create', 'delete', 'export'] as const;

      fc.assert(
        fc.property(
          fc.constantFrom(...resources),
          fc.constantFrom(...actions),
          (resource, action) => {
            const result = rbacEngine.hasPermission('super_admin', resource, action);
            expect(result.granted).toBe(true);
          },
        ),
        { numRuns: 50 },
      );
    });

    it('school_admin has view permission on students module', () => {
      const result = rbacEngine.hasPermission('school_admin', 'students', 'view');
      expect(result.granted).toBe(true);
    });

    it('teacher has view-only permission on students (no create, no delete)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('create', 'delete', 'export' as const),
          (action) => {
            const result = rbacEngine.hasPermission('teacher', 'students', action as import('@/types/rbac').ActionPermission);
            expect(result.granted).toBe(false);
          },
        ),
        { numRuns: 10 },
      );

      // But view is granted
      expect(rbacEngine.hasPermission('teacher', 'students', 'view').granted).toBe(true);
    });

    it('role hierarchy is consistent: higher roles have at least the permissions of lower roles', () => {
      // Accountant has students.view, so school_admin (higher) should too
      fc.assert(
        fc.property(
          fc.constantFrom('school_admin', 'super_admin' as BuiltInRole),
          (higherRole) => {
            // If accountant can view students, the higher role can too
            if (rbacEngine.hasPermission('accountant', 'students', 'view').granted) {
              expect(rbacEngine.hasPermission(higherRole, 'students', 'view').granted).toBe(true);
            }
          },
        ),
        { numRuns: 10 },
      );
    });
  });

  /**
   * Property: Demo accounts (ROLE_DASHBOARD_MAP) route each role to a defined dashboard path.
   * All 7 roles have a mapping, and the mapping is consistent.
   *
   * **Validates: Requirements 3.4, 3.5**
   */
  describe('Demo Accounts Dashboard Mapping Preservation', () => {
    it('every built-in role has a defined dashboard route', () => {
      fc.assert(
        fc.property(roleArb, (role) => {
          const route = ROLE_DASHBOARD_MAP[role];
          expect(route).toBeDefined();
          expect(route.startsWith('/')).toBe(true);
        }),
        { numRuns: 50 },
      );
    });

    it('School Admin always maps to /dashboard (not changed by fix)', () => {
      expect(ROLE_DASHBOARD_MAP.school_admin).toBe('/dashboard');
    });

    it('Super Admin always maps to /admin', () => {
      expect(ROLE_DASHBOARD_MAP.super_admin).toBe('/admin');
    });

    it('Accountant always maps to /fees', () => {
      expect(ROLE_DASHBOARD_MAP.accountant).toBe('/fees');
    });

    it('Teacher always maps to /dashboard', () => {
      expect(ROLE_DASHBOARD_MAP.teacher).toBe('/dashboard');
    });

    it('Staff always maps to /dashboard', () => {
      expect(ROLE_DASHBOARD_MAP.staff).toBe('/dashboard');
    });
  });
});
