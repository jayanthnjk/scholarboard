/**
 * Tenant configuration data for mock server.
 * Two sample tenants: Sunrise Academy (school) and Metro University (college).
 * @see Task 2.6 - MSW mock server system
 */

import type { TenantConfig, TenantId } from '@/types/tenant';

/** Navigation item shape for tenant-specific navigation */
export interface NavigationItem {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly path: string;
  readonly module: string;
  readonly children?: readonly NavigationItem[];
  readonly permissions?: readonly string[];
}

/** Tenant navigation configuration */
export interface TenantNavigation {
  readonly tenantId: TenantId;
  readonly items: readonly NavigationItem[];
}

export const TENANT_SUNRISE_ID = 'tenant_sunrise_001' as TenantId;
export const TENANT_METRO_ID = 'tenant_metro_002' as TenantId;

export const sunriseAcademy: TenantConfig = {
  id: TENANT_SUNRISE_ID,
  name: 'Sunrise Academy',
  subdomain: 'sunrise',
  customDomain: 'erp.sunriseacademy.edu',
  branding: {
    logo: '/tenants/sunrise/logo.svg',
    favicon: '/tenants/sunrise/favicon.ico',
    primaryColor: '#1E40AF',
    secondaryColor: '#F59E0B',
    accentColor: '#10B981',
    fontFamily: 'Inter, sans-serif',
    schoolTheme: 'school',
  },
  modules: [
    { id: 'dashboard', name: 'Dashboard', enabled: true, order: 1 },
    { id: 'students', name: 'Students', enabled: true, order: 2 },
    { id: 'fees', name: 'Fee Management', enabled: true, order: 3 },
    { id: 'attendance', name: 'Attendance', enabled: true, order: 4 },
    { id: 'academics', name: 'Academics', enabled: true, order: 5 },
    { id: 'examinations', name: 'Examinations', enabled: true, order: 6 },
    { id: 'transport', name: 'Transport', enabled: true, order: 7 },
    { id: 'library', name: 'Library', enabled: true, order: 8 },
    { id: 'hostel', name: 'Hostel', enabled: false, order: 9 },
    { id: 'reports', name: 'Reports', enabled: true, order: 10 },
    { id: 'settings', name: 'Settings', enabled: true, order: 11 },
  ],
  featureFlags: {
    enableOnlinePayment: true,
    enableSMS: true,
    enableEmail: true,
    enableParentPortal: true,
    enableStudentPortal: true,
    enableBiometricAttendance: false,
    enableTransportTracking: true,
    enableLibraryBarcode: true,
    enableBulkImport: true,
    enableBulkExport: true,
    enableAdvancedReports: true,
    enableMultiLanguage: true,
    enableDarkMode: true,
    enableMFA: false,
    enableAuditLog: true,
  },
  locale: {
    defaultLocale: 'en-IN',
    supportedLocales: ['en-IN', 'hi-IN', 'ta-IN'],
    dateFormat: 'DD/MM/YYYY',
    currencyCode: 'INR',
    numberFormat: 'en-IN',
    direction: 'ltr',
  },
  academicYear: {
    id: 'ay_2024_25',
    name: '2024-2025',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    terms: [
      { id: 'term_1', name: 'Term 1', startDate: '2024-04-01', endDate: '2024-09-30' },
      { id: 'term_2', name: 'Term 2', startDate: '2024-10-01', endDate: '2025-03-31' },
    ],
    isCurrent: true,
  },
  feeStructure: {
    id: 'fs_sunrise_2024',
    name: 'Fee Structure 2024-25',
    academicYear: '2024-2025',
    categories: ['Tuition', 'Transport', 'Library', 'Lab', 'Sports', 'Exam'],
  },
  admissionWorkflow: {
    id: 'wf_admission_sunrise',
    name: 'Student Admission Workflow',
    stepsCount: 5,
  },
  emailTemplates: [
    {
      id: 'et_welcome',
      type: 'welcome',
      subject: 'Welcome to Sunrise Academy',
      body: 'Dear {{studentName}}, Welcome to Sunrise Academy...',
      variables: ['studentName', 'className', 'rollNumber'],
    },
    {
      id: 'et_fee_reminder',
      type: 'fee_reminder',
      subject: 'Fee Payment Reminder',
      body: 'Dear {{parentName}}, This is a reminder for fee payment...',
      variables: ['parentName', 'studentName', 'amount', 'dueDate'],
    },
  ],
  smsTemplates: [
    {
      id: 'sms_attendance',
      type: 'attendance',
      subject: 'Attendance Alert',
      body: 'Dear Parent, {{studentName}} was marked {{status}} today.',
      variables: ['studentName', 'status', 'date'],
    },
  ],
};

export const metroUniversity: TenantConfig = {
  id: TENANT_METRO_ID,
  name: 'Metro University',
  subdomain: 'metro',
  customDomain: 'portal.metrouniversity.edu',
  branding: {
    logo: '/tenants/metro/logo.svg',
    favicon: '/tenants/metro/favicon.ico',
    primaryColor: '#7C3AED',
    secondaryColor: '#EC4899',
    accentColor: '#06B6D4',
    fontFamily: 'Poppins, sans-serif',
    schoolTheme: 'college',
  },
  modules: [
    { id: 'dashboard', name: 'Dashboard', enabled: true, order: 1 },
    { id: 'students', name: 'Student Management', enabled: true, order: 2 },
    { id: 'fees', name: 'Fee & Finance', enabled: true, order: 3 },
    { id: 'attendance', name: 'Attendance', enabled: true, order: 4 },
    { id: 'academics', name: 'Academic Programs', enabled: true, order: 5 },
    { id: 'examinations', name: 'Examinations', enabled: true, order: 6 },
    { id: 'placements', name: 'Placements', enabled: true, order: 7 },
    { id: 'research', name: 'Research', enabled: true, order: 8 },
    { id: 'hostel', name: 'Hostel', enabled: true, order: 9 },
    { id: 'library', name: 'Library', enabled: true, order: 10 },
    { id: 'reports', name: 'Reports & Analytics', enabled: true, order: 11 },
    { id: 'settings', name: 'Settings', enabled: true, order: 12 },
  ],
  featureFlags: {
    enableOnlinePayment: true,
    enableSMS: true,
    enableEmail: true,
    enableParentPortal: false,
    enableStudentPortal: true,
    enableBiometricAttendance: true,
    enableTransportTracking: false,
    enableLibraryBarcode: true,
    enableBulkImport: true,
    enableBulkExport: true,
    enableAdvancedReports: true,
    enableMultiLanguage: true,
    enableDarkMode: true,
    enableMFA: true,
    enableAuditLog: true,
    enablePlacementPortal: true,
    enableResearchPortal: true,
  },
  locale: {
    defaultLocale: 'en-US',
    supportedLocales: ['en-US', 'es-MX'],
    dateFormat: 'MM/DD/YYYY',
    currencyCode: 'USD',
    numberFormat: 'en-US',
    direction: 'ltr',
  },
  academicYear: {
    id: 'ay_2024_25_metro',
    name: 'Fall 2024 - Spring 2025',
    startDate: '2024-08-15',
    endDate: '2025-05-30',
    terms: [
      { id: 'fall_2024', name: 'Fall 2024', startDate: '2024-08-15', endDate: '2024-12-15' },
      { id: 'spring_2025', name: 'Spring 2025', startDate: '2025-01-10', endDate: '2025-05-30' },
    ],
    isCurrent: true,
  },
  feeStructure: {
    id: 'fs_metro_2024',
    name: 'Fee Structure Fall 2024',
    academicYear: 'Fall 2024 - Spring 2025',
    categories: ['Tuition', 'Lab', 'Library', 'Sports', 'Technology', 'Health', 'Activity'],
  },
  admissionWorkflow: {
    id: 'wf_admission_metro',
    name: 'University Admission Process',
    stepsCount: 7,
  },
  emailTemplates: [
    {
      id: 'et_admission_confirm',
      type: 'admission_confirmation',
      subject: 'Admission Confirmed - Metro University',
      body: 'Dear {{studentName}}, Your admission to {{program}} has been confirmed...',
      variables: ['studentName', 'program', 'semester', 'enrollmentId'],
    },
  ],
  smsTemplates: [
    {
      id: 'sms_fee_due',
      type: 'fee_due',
      subject: 'Fee Due',
      body: 'Fee of {{amount}} for {{semester}} is due on {{dueDate}}.',
      variables: ['amount', 'semester', 'dueDate'],
    },
  ],
};

/** All tenants indexed by ID */
export const tenantsById: Record<string, TenantConfig> = {
  [TENANT_SUNRISE_ID]: sunriseAcademy,
  [TENANT_METRO_ID]: metroUniversity,
};

/** All tenants indexed by subdomain */
export const tenantsBySubdomain: Record<string, TenantConfig> = {
  sunrise: sunriseAcademy,
  metro: metroUniversity,
};

/** Navigation config for Sunrise Academy */
export const sunriseNavigation: TenantNavigation = {
  tenantId: TENANT_SUNRISE_ID,
  items: [
    { id: 'nav_dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', module: 'dashboard' },
    {
      id: 'nav_students', label: 'Students', icon: 'Users', path: '/students', module: 'students',
      children: [
        { id: 'nav_students_list', label: 'All Students', icon: 'List', path: '/students', module: 'students' },
        { id: 'nav_students_admission', label: 'New Admission', icon: 'UserPlus', path: '/students/admission', module: 'students', permissions: ['students.create'] },
        { id: 'nav_students_bulk', label: 'Bulk Import', icon: 'Upload', path: '/students/bulk-import', module: 'students', permissions: ['students.bulk_import'] },
      ],
    },
    {
      id: 'nav_fees', label: 'Fee Management', icon: 'IndianRupee', path: '/fees', module: 'fees',
      children: [
        { id: 'nav_fees_structure', label: 'Fee Structure', icon: 'FileText', path: '/fees/structure', module: 'fees' },
        { id: 'nav_fees_payments', label: 'Payments', icon: 'CreditCard', path: '/fees/payments', module: 'fees' },
        { id: 'nav_fees_defaulters', label: 'Defaulters', icon: 'AlertTriangle', path: '/fees/defaulters', module: 'fees' },
        { id: 'nav_fees_analytics', label: 'Analytics', icon: 'BarChart', path: '/fees/analytics', module: 'fees', permissions: ['fees.analytics'] },
      ],
    },
    { id: 'nav_attendance', label: 'Attendance', icon: 'CheckSquare', path: '/attendance', module: 'attendance' },
    { id: 'nav_reports', label: 'Reports', icon: 'FileBarChart', path: '/reports', module: 'reports', permissions: ['reports.view'] },
    { id: 'nav_settings', label: 'Settings', icon: 'Settings', path: '/settings', module: 'settings', permissions: ['settings.view'] },
  ],
};

/** Navigation config for Metro University */
export const metroNavigation: TenantNavigation = {
  tenantId: TENANT_METRO_ID,
  items: [
    { id: 'nav_dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', module: 'dashboard' },
    {
      id: 'nav_students', label: 'Students', icon: 'GraduationCap', path: '/students', module: 'students',
      children: [
        { id: 'nav_students_list', label: 'All Students', icon: 'List', path: '/students', module: 'students' },
        { id: 'nav_students_admission', label: 'Enrollment', icon: 'UserPlus', path: '/students/enrollment', module: 'students', permissions: ['students.create'] },
      ],
    },
    {
      id: 'nav_fees', label: 'Finance', icon: 'DollarSign', path: '/fees', module: 'fees',
      children: [
        { id: 'nav_fees_structure', label: 'Fee Structure', icon: 'FileText', path: '/fees/structure', module: 'fees' },
        { id: 'nav_fees_payments', label: 'Payments', icon: 'CreditCard', path: '/fees/payments', module: 'fees' },
        { id: 'nav_fees_defaulters', label: 'Outstanding', icon: 'AlertTriangle', path: '/fees/defaulters', module: 'fees' },
      ],
    },
    { id: 'nav_placements', label: 'Placements', icon: 'Briefcase', path: '/placements', module: 'placements' },
    { id: 'nav_research', label: 'Research', icon: 'BookOpen', path: '/research', module: 'research' },
    { id: 'nav_reports', label: 'Analytics', icon: 'BarChart', path: '/reports', module: 'reports', permissions: ['reports.view'] },
    { id: 'nav_settings', label: 'Settings', icon: 'Settings', path: '/settings', module: 'settings', permissions: ['settings.view'] },
  ],
};

/** Get navigation for a tenant */
export function getNavigationForTenant(tenantId: string): TenantNavigation | undefined {
  if (tenantId === TENANT_SUNRISE_ID) return sunriseNavigation;
  if (tenantId === TENANT_METRO_ID) return metroNavigation;
  return undefined;
}
