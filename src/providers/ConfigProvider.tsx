/**
 * Config Provider for navigation, feature flags, and workflow configuration.
 * Generates sidebar navigation from tenant modules + user role + permissions.
 * @see Requirements 3.1, 3.2, 3.4, 3.5, 3.6, 3.7
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAppStore } from '@/store';
import type { NavigationItem, NavigationConfig, WorkflowConfig } from '@/types/config';
import type { ModuleConfig } from '@/types/tenant';

/** Feature flag definitions */
type FeatureFlags = Readonly<Record<string, boolean>>;

/** Config context value interface */
interface ConfigContextValue {
  /** Generated navigation configuration */
  readonly navigation: NavigationConfig;
  /** Active feature flags */
  readonly featureFlags: FeatureFlags;
  /** Check if a specific feature is enabled */
  readonly isFeatureEnabled: (flagKey: string) => boolean;
  /** Workflow configurations */
  readonly workflows: readonly WorkflowConfig[];
  /** Loading state */
  readonly isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

/** Default navigation for fallback */
const DEFAULT_NAVIGATION: NavigationConfig = {
  items: [],
  maxDepth: 4,
};

/** Base navigation structure - filtered by modules and permissions */
const BASE_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    permissions: [],
    group: 'MAIN MENU',
  },
  {
    id: 'reports',
    label: 'Analytics',
    icon: 'BarChart3',
    path: '/reports',
    permissions: [],
    featureFlag: 'module_reports',
    group: 'MAIN MENU',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: 'CalendarDays',
    path: '/calendar',
    permissions: [],
    featureFlag: 'module_calendar',
    group: 'MAIN MENU',
  },
  {
    id: 'communication',
    label: 'Messages',
    icon: 'MessageSquare',
    path: '/communication',
    permissions: [],
    featureFlag: 'module_communication',
    group: 'MAIN MENU',
  },
  {
    id: 'admissions',
    label: 'Registration',
    icon: 'UserPlus',
    path: '/admissions',
    permissions: [],
    featureFlag: 'module_admissions',
    group: 'ACADEMIC MANAGEMENT',
  },
  {
    id: 'students',
    label: 'Students',
    icon: 'Users',
    path: '/students',
    permissions: [],
    featureFlag: 'module_students',
    group: 'ACADEMIC MANAGEMENT',
  },
  {
    id: 'fees',
    label: 'Fees',
    icon: 'CreditCard',
    path: '/fees',
    permissions: [],
    featureFlag: 'module_fees',
    group: 'ACADEMIC MANAGEMENT',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: 'CheckSquare',
    path: '/attendance',
    permissions: [],
    featureFlag: 'module_attendance',
    group: 'ACADEMIC MANAGEMENT',
  },
  {
    id: 'exams',
    label: 'Exam Board',
    icon: 'FileText',
    path: '/exams',
    permissions: [],
    featureFlag: 'module_exams',
    group: 'ACADEMIC MANAGEMENT',
  },
  {
    id: 'timetable',
    label: 'Timetable',
    icon: 'Calendar',
    path: '/timetable',
    permissions: [],
    featureFlag: 'module_timetable',
    group: 'ACADEMIC MANAGEMENT',
  },
  {
    id: 'staff',
    label: 'Faculty',
    icon: 'Briefcase',
    path: '/staff',
    permissions: [],
    featureFlag: 'module_staff',
    group: 'ACADEMIC MANAGEMENT',
  },
  {
    id: 'library',
    label: 'Library',
    icon: 'BookOpen',
    path: '/library',
    permissions: [],
    featureFlag: 'module_library',
    group: 'ACADEMIC MANAGEMENT',
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: 'GraduationCap',
    path: '/courses',
    permissions: [],
    group: 'ACADEMIC MANAGEMENT',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/settings',
    permissions: [],
    group: 'SYSTEM',
  },
];

/** Student portal navigation - self-service focused */
const STUDENT_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    id: 'student-dashboard',
    label: 'My Dashboard',
    icon: 'LayoutDashboard',
    path: '/student-portal',
    permissions: [],
  },
  {
    id: 'student-academics',
    label: 'My Academics',
    icon: 'FileText',
    path: '/exams',
    permissions: [],
  },
  {
    id: 'student-fees',
    label: 'My Fees',
    icon: 'CreditCard',
    path: '/fees',
    permissions: [],
  },
  {
    id: 'student-attendance',
    label: 'My Attendance',
    icon: 'CheckSquare',
    path: '/attendance',
    permissions: [],
  },
  {
    id: 'student-timetable',
    label: 'Timetable',
    icon: 'Calendar',
    path: '/timetable',
    permissions: [],
  },
  {
    id: 'student-library',
    label: 'Library',
    icon: 'BookOpen',
    path: '/library',
    permissions: [],
  },
  {
    id: 'student-help',
    label: 'Help',
    icon: 'HelpCircle',
    path: '/help',
    permissions: [],
  },
];

/** Parent portal navigation - child monitoring focused */
const PARENT_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    id: 'parent-dashboard',
    label: 'Children Dashboard',
    icon: 'LayoutDashboard',
    path: '/parent-portal',
    permissions: [],
  },
  {
    id: 'parent-fees',
    label: 'Fee Payments',
    icon: 'CreditCard',
    path: '/fees',
    permissions: [],
  },
  {
    id: 'parent-academics',
    label: 'Academic Reports',
    icon: 'FileText',
    path: '/exams',
    permissions: [],
  },
  {
    id: 'parent-attendance',
    label: 'Attendance Summary',
    icon: 'CheckSquare',
    path: '/attendance',
    permissions: [],
  },
  {
    id: 'parent-communication',
    label: 'Communication',
    icon: 'MessageSquare',
    path: '/communication',
    permissions: [],
  },
  {
    id: 'parent-calendar',
    label: 'Calendar',
    icon: 'CalendarDays',
    path: '/calendar',
    permissions: [],
  },
];

/**
 * Role→module access mapping for restricted institutional roles.
 * Defines which navigation item IDs each role is allowed to see.
 * School Admin sees all BASE_NAVIGATION_ITEMS (no restriction needed).
 * Super Admin uses SUPER_ADMIN_NAVIGATION_ITEMS (separate set).
 * Student and Parent use their own dedicated navigation sets.
 */
const ROLE_ALLOWED_MODULES: Readonly<Record<string, readonly string[]>> = {
  teacher: ['dashboard', 'students', 'attendance', 'exams', 'timetable', 'communication', 'library'],
  accountant: ['dashboard', 'students', 'fees', 'reports'],
  staff: ['dashboard', 'students', 'attendance', 'fees', 'communication', 'library'],
  school_admin: [
    'dashboard', 'students', 'fees', 'attendance', 'exams', 'timetable',
    'staff', 'communication', 'library', 'reports', 'admissions', 'calendar',
    'settings', 'transport', 'documents', 'workflows', 'help', 'courses',
  ],
};

/** Super Admin navigation - tenant management focused */
const SUPER_ADMIN_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    id: 'admin-tenants',
    label: 'Tenants',
    icon: 'Building2',
    path: '/admin',
    permissions: [],
  },
  {
    id: 'admin-analytics',
    label: 'Platform Analytics',
    icon: 'BarChart3',
    path: '/admin/analytics',
    permissions: [],
  },
  {
    id: 'admin-subscriptions',
    label: 'Subscriptions',
    icon: 'CreditCard',
    path: '/admin/subscriptions',
    permissions: [],
  },
  {
    id: 'dashboard',
    label: 'School Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    permissions: [],
  },
  {
    id: 'students',
    label: 'Students',
    icon: 'Users',
    path: '/students',
    permissions: [],
  },
  {
    id: 'fees',
    label: 'Fees',
    icon: 'Wallet',
    path: '/fees',
    permissions: [],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'BarChart3',
    path: '/reports',
    permissions: [],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/settings',
    permissions: [],
  },
];

interface ConfigProviderProps {
  readonly children: React.ReactNode;
}

/**
 * ConfigProvider generates navigation and provides feature flags.
 * Navigation is dynamically generated based on:
 * 1. Tenant enabled modules
 * 2. User role and permissions
 * 3. Feature flag states
 */
export function ConfigProvider({ children }: ConfigProviderProps): React.JSX.Element {
  const [workflows] = useState<WorkflowConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tenantModules = useAppStore((s) => s.tenant.current?.modules);
  const tenantFeatureFlags = useAppStore((s) => s.tenant.current?.featureFlags);
  const userPermissions = useAppStore((s) => s.auth.user?.permissions);
  const userRole = useAppStore((s) => s.auth.user?.role);

  // Merge feature flags
  const featureFlags = useMemo<FeatureFlags>(() => {
    const flags: Record<string, boolean> = {};

    // Tenant-level flags
    if (tenantFeatureFlags) {
      Object.assign(flags, tenantFeatureFlags);
    }

    // Module-based flags
    if (tenantModules) {
      for (const mod of tenantModules) {
        flags[`module_${mod.id}`] = mod.enabled;
      }
    }

    return flags;
  }, [tenantFeatureFlags, tenantModules]);

  /** Check if a feature flag is enabled */
  const isFeatureEnabled = useCallback(
    (flagKey: string): boolean => {
      // If no tenant config is loaded (dev mode), all features are enabled
      if (Object.keys(featureFlags).length === 0) return true;
      return featureFlags[flagKey] ?? true;
    },
    [featureFlags],
  );

  /** Generate filtered navigation based on user context */
  const navigation = useMemo<NavigationConfig>(() => {
    if (!userRole) return DEFAULT_NAVIGATION;

    const permissions = new Set(userPermissions ?? []);
    const isSuperAdmin = userRole === 'super_admin';
    const isStudent = userRole === 'student';
    const isParent = userRole === 'parent';

    // Determine source navigation items based on role
    let sourceItems: readonly NavigationItem[];
    if (isSuperAdmin) {
      sourceItems = SUPER_ADMIN_NAVIGATION_ITEMS;
    } else if (isStudent) {
      sourceItems = STUDENT_NAVIGATION_ITEMS;
    } else if (isParent) {
      sourceItems = PARENT_NAVIGATION_ITEMS;
    } else {
      sourceItems = BASE_NAVIGATION_ITEMS;
    }

    // Get allowed module IDs for restricted roles (teacher, accountant, staff)
    const allowedModules = ROLE_ALLOWED_MODULES[userRole] ?? null;

    const filterItems = (items: readonly NavigationItem[]): NavigationItem[] => {
      return items
        .filter((item) => {
          // Check feature flag
          if (item.featureFlag && !isFeatureEnabled(item.featureFlag)) {
            return false;
          }

          // Super admin, student, parent see all their respective nav items
          if (isSuperAdmin || isStudent || isParent) return true;

          // For institutional roles: filter by allowed modules
          if (allowedModules && !allowedModules.includes(item.id)) {
            return false;
          }

          // Check permissions
          if (item.permissions.length > 0) {
            const hasAccess = item.permissions.some((perm) => permissions.has(perm));
            if (!hasAccess) return false;
          }

          return true;
        })
        .map((item) => {
          // Add fee sub-navigation for fee items with children filtered by permissions
          if (item.id === 'fees' && !isStudent && !isParent) {
            // No sub-navigation needed - FeesOverviewPage has built-in tabs
            return item;
          }

          if (item.children && item.children.length > 0) {
            const filteredChildren = filterItems(item.children);
            return { ...item, children: filteredChildren };
          }
          return item;
        })
        .filter((item) => {
          // Remove parent items with no accessible children
          if (item.children && item.children.length === 0 && !item.path) {
            return false;
          }
          return true;
        });
    };

    const filteredItems = filterItems(sourceItems);

    // Sort by module order if available (only for BASE_NAVIGATION_ITEMS-based roles)
    if (tenantModules && !isSuperAdmin && !isStudent && !isParent) {
      const moduleOrder = new Map(tenantModules.map((m: ModuleConfig) => [m.id, m.order]));
      filteredItems.sort((a, b) => {
        const orderA = moduleOrder.get(a.id) ?? 999;
        const orderB = moduleOrder.get(b.id) ?? 999;
        return orderA - orderB;
      });
    }

    return {
      items: filteredItems,
      maxDepth: 4,
    };
  }, [userRole, userPermissions, tenantModules, isFeatureEnabled]);

  // Mark as loaded once we have tenant config or no tenant
  useEffect(() => {
    setIsLoading(false);
  }, [tenantModules]);

  const contextValue = useMemo<ConfigContextValue>(
    () => ({
      navigation,
      featureFlags,
      isFeatureEnabled,
      workflows,
      isLoading,
    }),
    [navigation, featureFlags, isFeatureEnabled, workflows, isLoading],
  );

  return <ConfigContext.Provider value={contextValue}>{children}</ConfigContext.Provider>;
}

/**
 * Hook to access config context.
 * Must be used within a ConfigProvider.
 */
export function useConfig(): ConfigContextValue {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

export { ConfigContext };
export type { ConfigContextValue };
