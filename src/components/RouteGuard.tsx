/**
 * Route Guard component for protecting routes based on RBAC permissions.
 * Wraps routes and redirects to permission-denied page if unauthorized.
 * @see Requirements 2.1, 2.6
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { usePermission } from '@/hooks/usePermission';
import type { ActionPermission } from '@/types/rbac';

interface RouteGuardProps {
  /** Child routes/content to render when authorized */
  readonly children: React.ReactNode;
  /** Resource to check permission against */
  readonly resource?: string;
  /** Action to check (defaults to 'view') */
  readonly action?: ActionPermission;
  /** Module access to check (alternative to resource/action) */
  readonly module?: string;
  /** Page access to check (alternative to resource/action) */
  readonly page?: string;
  /** Required roles (any of these roles grants access) */
  readonly roles?: readonly string[];
  /** Custom redirect path (defaults to /permission-denied) */
  readonly redirectTo?: string;
  /** Custom fallback component instead of redirect */
  readonly fallback?: React.ReactNode;
  /** Whether authentication is required (defaults to true) */
  readonly requireAuth?: boolean;
}

/**
 * RouteGuard protects routes by checking authentication and permissions.
 * Supports multiple authorization modes:
 * - Resource + Action check
 * - Module access check
 * - Page access check
 * - Role-based check
 *
 * @example
 * ```tsx
 * <RouteGuard resource="students" action="view">
 *   <StudentsPage />
 * </RouteGuard>
 *
 * <RouteGuard module="finance" roles={['accountant', 'school_admin']}>
 *   <FinanceDashboard />
 * </RouteGuard>
 * ```
 */
export function RouteGuard({
  children,
  resource,
  action = 'view',
  module,
  page,
  roles,
  redirectTo = '/permission-denied',
  fallback,
  requireAuth = true,
}: RouteGuardProps): React.JSX.Element {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { hasPermission, hasModuleAccess, hasPageAccess, role } = usePermission();

  // Show loading only during initial auth check (not when already authenticated)
  if (isLoading && !isAuthenticated) {
    return <RouteGuardSkeleton />;
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // If no permission checks specified, just require authentication
  if (!resource && !module && !page && !roles) {
    return <>{children}</>;
  }

  // Check role-based access
  if (roles && roles.length > 0) {
    const userRole = user?.role ?? role.name;
    if (!roles.includes(userRole)) {
      if (fallback) return <>{fallback}</>;
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Check module access
  if (module && !hasModuleAccess(module)) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to={redirectTo} replace />;
  }

  // Check page access
  if (page && !hasPageAccess(page)) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to={redirectTo} replace />;
  }

  // Check resource + action permission
  if (resource && !hasPermission(resource, action)) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

/** Loading skeleton while auth state resolves */
function RouteGuardSkeleton(): React.JSX.Element {
  return (
    <div
      className="flex h-screen w-full items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
    </div>
  );
}
