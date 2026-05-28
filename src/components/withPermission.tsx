/**
 * Higher-Order Component for conditionally rendering components based on RBAC permissions.
 * Supports fallback rendering and disable mode (show but disable instead of hide).
 * @see Requirements 2.1, 2.6
 */

import React from 'react';
import { usePermission } from '@/hooks/usePermission';
import type { ActionPermission } from '@/types/rbac';

interface WithPermissionOptions {
  /** Resource to check permission against */
  readonly resource: string;
  /** Action to check permission for */
  readonly action: ActionPermission;
  /** Fallback component to render when permission is denied */
  readonly fallback?: React.ReactNode;
  /**
   * If true, renders the wrapped component in a disabled state
   * with a tooltip instead of hiding it entirely.
   */
  readonly disableMode?: boolean;
}

/**
 * HOC that conditionally renders a component based on user permissions.
 *
 * @param WrappedComponent - The component to conditionally render
 * @param options - Permission check configuration
 *
 * @example
 * ```tsx
 * const ProtectedButton = withPermission(DeleteButton, {
 *   resource: 'students',
 *   action: 'delete',
 *   fallback: <span>No access</span>,
 * });
 *
 * const DisabledEditButton = withPermission(EditButton, {
 *   resource: 'students',
 *   action: 'edit',
 *   disableMode: true,
 * });
 * ```
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithPermissionOptions,
): React.FC<P> {
  const { resource, action, fallback = null, disableMode = false } = options;

  const displayName = WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component';

  const PermissionGuardedComponent: React.FC<P> = (props) => {
    const { hasPermission } = usePermission();
    const isAllowed = hasPermission(resource, action);

    if (isAllowed) {
      return <WrappedComponent {...props} />;
    }

    if (disableMode) {
      return (
        <div
          className="relative inline-block"
          title={`You don't have permission to ${action} ${resource}`}
          aria-disabled="true"
        >
          <div className="pointer-events-none opacity-50">
            <WrappedComponent {...props} />
          </div>
        </div>
      );
    }

    return <>{fallback}</>;
  };

  PermissionGuardedComponent.displayName = `withPermission(${displayName})`;
  return PermissionGuardedComponent;
}

/**
 * Inline permission gate component for JSX usage.
 * Alternative to the HOC pattern for simpler cases.
 *
 * @example
 * ```tsx
 * <PermissionGate resource="students" action="delete">
 *   <DeleteButton />
 * </PermissionGate>
 * ```
 */
interface PermissionGateProps {
  /** Resource to check permission against */
  readonly resource: string;
  /** Action to check permission for */
  readonly action: ActionPermission;
  /** Content to render when permission is granted */
  readonly children: React.ReactNode;
  /** Fallback content when permission is denied */
  readonly fallback?: React.ReactNode;
  /** If true, render children in disabled state instead of hiding */
  readonly disableMode?: boolean;
}

export function PermissionGate({
  resource,
  action,
  children,
  fallback = null,
  disableMode = false,
}: PermissionGateProps): React.JSX.Element {
  const { hasPermission } = usePermission();
  const isAllowed = hasPermission(resource, action);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (disableMode) {
    return (
      <div
        className="relative inline-block"
        title={`You don't have permission to ${action} ${resource}`}
        aria-disabled="true"
      >
        <div className="pointer-events-none opacity-50">
          {children}
        </div>
      </div>
    );
  }

  return <>{fallback}</>;
}
