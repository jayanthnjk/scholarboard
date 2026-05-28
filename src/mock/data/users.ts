/**
 * User and role data generator for mock server.
 * Generates users for each role with realistic permissions.
 * @see Task 2.6 - MSW mock server system
 */

import { TENANT_SUNRISE_ID, TENANT_METRO_ID } from './tenants';

/** User role types */
export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'accountant'
  | 'teacher'
  | 'staff'
  | 'parent'
  | 'student';

/** Permission definition */
export interface Permission {
  readonly id: string;
  readonly module: string;
  readonly action: string;
  readonly description: string;
}

/** Role definition with permissions */
export interface RoleDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly permissions: readonly string[];
  readonly isSystemRole: boolean;
}

/** Mock user record */
export interface MockUser {
  readonly id: string;
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly role: UserRole;
  readonly tenantId: string;
  readonly avatar: string;
  readonly phone: string;
  readonly isActive: boolean;
  readonly lastLogin: string;
  readonly createdAt: string;
  readonly permissions: readonly string[];
}

/** All available permissions */
export const allPermissions: readonly Permission[] = [
  // Students
  { id: 'students.view', module: 'students', action: 'view', description: 'View student records' },
  { id: 'students.create', module: 'students', action: 'create', description: 'Create student records' },
  { id: 'students.update', module: 'students', action: 'update', description: 'Update student records' },
  { id: 'students.delete', module: 'students', action: 'delete', description: 'Delete student records' },
  { id: 'students.bulk_import', module: 'students', action: 'bulk_import', description: 'Bulk import students' },
  { id: 'students.bulk_export', module: 'students', action: 'bulk_export', description: 'Bulk export students' },
  // Fees
  { id: 'fees.view', module: 'fees', action: 'view', description: 'View fee records' },
  { id: 'fees.create', module: 'fees', action: 'create', description: 'Create fee structures' },
  { id: 'fees.update', module: 'fees', action: 'update', description: 'Update fee structures' },
  { id: 'fees.delete', module: 'fees', action: 'delete', description: 'Delete fee structures' },
  { id: 'fees.collect', module: 'fees', action: 'collect', description: 'Collect fee payments' },
  { id: 'fees.analytics', module: 'fees', action: 'analytics', description: 'View fee analytics' },
  { id: 'fees.refund', module: 'fees', action: 'refund', description: 'Process fee refunds' },
  // Attendance
  { id: 'attendance.view', module: 'attendance', action: 'view', description: 'View attendance' },
  { id: 'attendance.mark', module: 'attendance', action: 'mark', description: 'Mark attendance' },
  // Reports
  { id: 'reports.view', module: 'reports', action: 'view', description: 'View reports' },
  { id: 'reports.export', module: 'reports', action: 'export', description: 'Export reports' },
  // Settings
  { id: 'settings.view', module: 'settings', action: 'view', description: 'View settings' },
  { id: 'settings.update', module: 'settings', action: 'update', description: 'Update settings' },
  // Users
  { id: 'users.view', module: 'users', action: 'view', description: 'View users' },
  { id: 'users.create', module: 'users', action: 'create', description: 'Create users' },
  { id: 'users.update', module: 'users', action: 'update', description: 'Update users' },
  { id: 'users.delete', module: 'users', action: 'delete', description: 'Delete users' },
  // Tenant
  { id: 'tenant.manage', module: 'tenant', action: 'manage', description: 'Manage tenant config' },
];

/** Role definitions with permission mappings */
export const roleDefinitions: Record<UserRole, RoleDefinition> = {
  super_admin: {
    id: 'role_super_admin',
    name: 'Super Admin',
    description: 'Full system access across all tenants',
    permissions: allPermissions.map((p) => p.id),
    isSystemRole: true,
  },
  school_admin: {
    id: 'role_school_admin',
    name: 'School Administrator',
    description: 'Full access within assigned tenant',
    permissions: allPermissions.filter((p) => p.module !== 'tenant').map((p) => p.id),
    isSystemRole: true,
  },
  accountant: {
    id: 'role_accountant',
    name: 'Accountant',
    description: 'Fee management and financial reporting',
    permissions: [
      'students.view',
      'fees.view', 'fees.create', 'fees.update', 'fees.collect', 'fees.analytics', 'fees.refund',
      'reports.view', 'reports.export',
    ],
    isSystemRole: true,
  },
  teacher: {
    id: 'role_teacher',
    name: 'Teacher',
    description: 'Academic management and attendance',
    permissions: [
      'students.view',
      'attendance.view', 'attendance.mark',
      'reports.view',
    ],
    isSystemRole: true,
  },
  staff: {
    id: 'role_staff',
    name: 'Staff',
    description: 'Limited administrative tasks',
    permissions: [
      'students.view',
      'attendance.view',
      'fees.view',
    ],
    isSystemRole: true,
  },
  parent: {
    id: 'role_parent',
    name: 'Parent',
    description: 'View own children records and fees',
    permissions: [
      'students.view',
      'fees.view',
      'attendance.view',
    ],
    isSystemRole: true,
  },
  student: {
    id: 'role_student',
    name: 'Student',
    description: 'View own records',
    permissions: [
      'students.view',
      'fees.view',
      'attendance.view',
    ],
    isSystemRole: true,
  },
};

/** Pre-generated mock users */
export const mockUsers: readonly MockUser[] = [
  // Sunrise Academy users
  {
    id: 'user_sa_001',
    email: 'admin@sunriseacademy.edu',
    password: 'Admin@123',
    name: 'Rajesh Kumar',
    role: 'super_admin',
    tenantId: TENANT_SUNRISE_ID,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
    phone: '+91-9876543210',
    isActive: true,
    lastLogin: '2024-11-15T08:30:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    permissions: roleDefinitions.super_admin.permissions,
  },
  {
    id: 'user_sa_002',
    email: 'principal@sunriseacademy.edu',
    password: 'Principal@123',
    name: 'Dr. Priya Sharma',
    role: 'school_admin',
    tenantId: TENANT_SUNRISE_ID,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    phone: '+91-9876543211',
    isActive: true,
    lastLogin: '2024-11-15T09:00:00Z',
    createdAt: '2023-01-15T00:00:00Z',
    permissions: roleDefinitions.school_admin.permissions,
  },
  {
    id: 'user_sa_003',
    email: 'accounts@sunriseacademy.edu',
    password: 'Accounts@123',
    name: 'Suresh Patel',
    role: 'accountant',
    tenantId: TENANT_SUNRISE_ID,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suresh',
    phone: '+91-9876543212',
    isActive: true,
    lastLogin: '2024-11-15T08:45:00Z',
    createdAt: '2023-02-01T00:00:00Z',
    permissions: roleDefinitions.accountant.permissions,
  },
  {
    id: 'user_sa_004',
    email: 'teacher.math@sunriseacademy.edu',
    password: 'Teacher@123',
    name: 'Anita Desai',
    role: 'teacher',
    tenantId: TENANT_SUNRISE_ID,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anita',
    phone: '+91-9876543213',
    isActive: true,
    lastLogin: '2024-11-14T14:30:00Z',
    createdAt: '2023-03-01T00:00:00Z',
    permissions: roleDefinitions.teacher.permissions,
  },
  {
    id: 'user_sa_005',
    email: 'staff@sunriseacademy.edu',
    password: 'Staff@123',
    name: 'Vikram Singh',
    role: 'staff',
    tenantId: TENANT_SUNRISE_ID,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
    phone: '+91-9876543214',
    isActive: true,
    lastLogin: '2024-11-13T10:00:00Z',
    createdAt: '2023-04-01T00:00:00Z',
    permissions: roleDefinitions.staff.permissions,
  },
  {
    id: 'user_sa_006',
    email: 'parent.sharma@gmail.com',
    password: 'Parent@123',
    name: 'Meera Sharma',
    role: 'parent',
    tenantId: TENANT_SUNRISE_ID,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=meera',
    phone: '+91-9876543215',
    isActive: true,
    lastLogin: '2024-11-15T07:30:00Z',
    createdAt: '2023-06-01T00:00:00Z',
    permissions: roleDefinitions.parent.permissions,
  },
  {
    id: 'user_sa_007',
    email: 'student.arjun@sunriseacademy.edu',
    password: 'Student@123',
    name: 'Arjun Sharma',
    role: 'student',
    tenantId: TENANT_SUNRISE_ID,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
    phone: '+91-9876543216',
    isActive: true,
    lastLogin: '2024-11-15T06:30:00Z',
    createdAt: '2023-06-15T00:00:00Z',
    permissions: roleDefinitions.student.permissions,
  },
  // Metro University users
  {
    id: 'user_mu_001',
    email: 'admin@metrouniversity.edu',
    password: 'Admin@123',
    name: 'Dr. James Wilson',
    role: 'super_admin',
    tenantId: TENANT_METRO_ID,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    phone: '+1-555-0101',
    isActive: true,
    lastLogin: '2024-11-15T09:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    permissions: roleDefinitions.super_admin.permissions,
  },
  {
    id: 'user_mu_002',
    email: 'dean@metrouniversity.edu',
    password: 'Dean@123',
    name: 'Dr. Sarah Johnson',
    role: 'school_admin',
    tenantId: TENANT_METRO_ID,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    phone: '+1-555-0102',
    isActive: true,
    lastLogin: '2024-11-15T08:30:00Z',
    createdAt: '2023-01-15T00:00:00Z',
    permissions: roleDefinitions.school_admin.permissions,
  },
  {
    id: 'user_mu_003',
    email: 'finance@metrouniversity.edu',
    password: 'Finance@123',
    name: 'Michael Chen',
    role: 'accountant',
    tenantId: TENANT_METRO_ID,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    phone: '+1-555-0103',
    isActive: true,
    lastLogin: '2024-11-15T08:00:00Z',
    createdAt: '2023-02-01T00:00:00Z',
    permissions: roleDefinitions.accountant.permissions,
  },
  {
    id: 'user_mu_004',
    email: 'professor.cs@metrouniversity.edu',
    password: 'Prof@123',
    name: 'Dr. Emily Davis',
    role: 'teacher',
    tenantId: TENANT_METRO_ID,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    phone: '+1-555-0104',
    isActive: true,
    lastLogin: '2024-11-14T16:00:00Z',
    createdAt: '2023-03-01T00:00:00Z',
    permissions: roleDefinitions.teacher.permissions,
  },
  {
    id: 'user_mu_005',
    email: 'student.alex@metrouniversity.edu',
    password: 'Student@123',
    name: 'Alex Martinez',
    role: 'student',
    tenantId: TENANT_METRO_ID,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    phone: '+1-555-0105',
    isActive: true,
    lastLogin: '2024-11-15T07:00:00Z',
    createdAt: '2023-08-15T00:00:00Z',
    permissions: roleDefinitions.student.permissions,
  },
];

/** Get users for a specific tenant */
export function getUsersForTenant(tenantId: string): readonly MockUser[] {
  return mockUsers.filter((u) => u.tenantId === tenantId);
}

/** Find user by email and password */
export function authenticateUser(
  email: string,
  password: string,
): MockUser | undefined {
  return mockUsers.find((u) => u.email === email && u.password === password && u.isActive);
}

/** Find user by ID */
export function findUserById(userId: string): MockUser | undefined {
  return mockUsers.find((u) => u.id === userId);
}
