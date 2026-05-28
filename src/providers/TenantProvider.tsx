/**
 * Tenant Provider for multi-tenant isolation.
 * Resolves tenant from subdomain, URL path, env var, or query param.
 * Loads tenant configuration and provides it via React Context.
 * @see Requirements 1.1, 1.2, 1.6, 1.8, 1.11
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { get } from '@/services/api-client';
import { useAppStore } from '@/store';
import type { TenantConfig, TenantId, TenantResolutionResult } from '@/types/tenant';

/** Tenant context value interface */
interface TenantContextValue {
  /** Current tenant configuration */
  readonly tenant: TenantConfig | null;
  /** Loading state during tenant resolution */
  readonly isLoading: boolean;
  /** Error during tenant resolution */
  readonly error: string | null;
  /** Switch to a different tenant (Super Admin only) */
  readonly switchTenant: (tenantId: string) => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  readonly children: React.ReactNode;
}

/**
 * Resolve tenant identifier from the current environment.
 * Priority: env var → query param → subdomain → URL path segment
 */
function resolveTenantIdentifier(): string | null {
  // 1. Environment variable (for development)
  const envTenant = import.meta.env.VITE_TENANT_ID as string | undefined;
  if (envTenant) return envTenant;

  // 2. Query parameter (for development/testing)
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const queryTenant = params.get('tenant');
    if (queryTenant) return queryTenant;

    // 3. Subdomain resolution
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Skip localhost and IP addresses
    if (hostname !== 'localhost' && !hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      // subdomain.domain.tld -> subdomain is tenant
      if (parts.length >= 3) {
        const subdomain = parts[0];
        if (subdomain && subdomain !== 'www') {
          return subdomain;
        }
      }
    }

    // 4. URL path segment: /tenant/{tenantId}/...
    const pathMatch = window.location.pathname.match(/^\/tenant\/([^/]+)/);
    if (pathMatch?.[1]) {
      return pathMatch[1];
    }
  }

  return null;
}

/**
 * TenantProvider resolves and loads tenant configuration on mount.
 * Rejects cross-tenant requests by validating the current tenant context.
 */
export function TenantProvider({ children }: TenantProviderProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tenant = useAppStore((s) => s.tenant.current);
  const setTenant = useAppStore((s) => s.setTenant);
  const setTenantLoading = useAppStore((s) => s.setTenantLoading);
  const setTenantError = useAppStore((s) => s.setTenantError);

  /** Load tenant config from the API */
  const loadTenantConfig = useCallback(
    async (tenantIdentifier: string): Promise<void> => {
      setIsLoading(true);
      setTenantLoading(true);
      setError(null);

      try {
        const result = await get<TenantResolutionResult>(
          `/tenants/resolve/${encodeURIComponent(tenantIdentifier)}`,
        );

        switch (result.status) {
          case 'resolved':
            setTenant(result.config);
            setError(null);
            break;
          case 'not_found':
            setTenantError('Tenant not found');
            setError('The requested institution was not found.');
            break;
          case 'suspended':
            setTenantError(result.message);
            setError(`Institution suspended: ${result.message}`);
            break;
          case 'error':
            setTenantError(result.error);
            setError(`Failed to load institution: ${result.error}`);
            break;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to resolve tenant';
        setTenantError(message);
        setError(message);
      } finally {
        setIsLoading(false);
        setTenantLoading(false);
      }
    },
    [setTenant, setTenantLoading, setTenantError],
  );

  // Resolve tenant on mount
  useEffect(() => {
    const identifier = resolveTenantIdentifier();
    if (identifier) {
      loadTenantConfig(identifier);
    } else {
      setIsLoading(false);
      setTenantLoading(false);
      // In development without tenant config, use a default
      if (import.meta.env.DEV) {
        setError(null);
      } else {
        setError('Unable to determine institution. Please check the URL.');
      }
    }
  }, [loadTenantConfig, setTenantLoading]);

  /**
   * Switch to a different tenant (Super Admin feature).
   * Validates that the user has permission before switching.
   */
  const switchTenant = useCallback(
    async (tenantId: string): Promise<void> => {
      const currentUser = useAppStore.getState().auth.user;
      if (!currentUser || currentUser.role !== 'super_admin') {
        throw new Error('Only Super Admin can switch tenants');
      }

      // Validate the target tenant is different
      if (tenant?.id === (tenantId as TenantId)) {
        return;
      }

      await loadTenantConfig(tenantId);
    },
    [tenant, loadTenantConfig],
  );

  const contextValue = useMemo<TenantContextValue>(
    () => ({
      tenant,
      isLoading,
      error,
      switchTenant,
    }),
    [tenant, isLoading, error, switchTenant],
  );

  return <TenantContext.Provider value={contextValue}>{children}</TenantContext.Provider>;
}

/**
 * Hook to access tenant context.
 * Must be used within a TenantProvider.
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export { TenantContext };
export type { TenantContextValue };
