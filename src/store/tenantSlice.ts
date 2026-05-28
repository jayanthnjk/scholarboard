/**
 * Tenant slice for Zustand store.
 * Manages current tenant configuration, loading state, and errors.
 * @see Requirements 1.1
 */

import type { StateCreator } from 'zustand';
import type { TenantConfig } from '../types/tenant';

export interface TenantSlice {
  tenant: {
    current: TenantConfig | null;
    isLoading: boolean;
    error: string | null;
  };
  setTenant: (config: TenantConfig | null) => void;
  setTenantLoading: (isLoading: boolean) => void;
  setTenantError: (error: string | null) => void;
}

export const createTenantSlice: StateCreator<TenantSlice, [], [], TenantSlice> = (set) => ({
  tenant: {
    current: null,
    isLoading: false,
    error: null,
  },
  setTenant: (config) =>
    set({
      tenant: { current: config, isLoading: false, error: null },
    }),
  setTenantLoading: (isLoading) =>
    set((state) => ({
      tenant: { ...state.tenant, isLoading },
    })),
  setTenantError: (error) =>
    set((state) => ({
      tenant: { ...state.tenant, error, isLoading: false },
    })),
});
