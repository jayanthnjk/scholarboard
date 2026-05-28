/**
 * Combined Zustand store with slices for the multi-tenant SaaS ERP UI platform.
 * Uses the slice pattern to organize state into logical domains.
 * @see Requirements 14.2, 1.1, 12.2
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createAuthSlice, type AuthSlice } from './authSlice';
import { createTenantSlice, type TenantSlice } from './tenantSlice';
import { createUISlice, type UISlice } from './uiSlice';
import { createBulkOpsSlice, type BulkOpsSlice } from './bulkOpsSlice';

export type AppStore = AuthSlice & TenantSlice & UISlice & BulkOpsSlice;

export const useAppStore = create<AppStore>()(
  devtools(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createTenantSlice(...a),
      ...createUISlice(...a),
      ...createBulkOpsSlice(...a),
    }),
    { name: 'erp-app-store' },
  ),
);

// Re-export slice types for convenience
export type { AuthSlice } from './authSlice';
export type { TenantSlice } from './tenantSlice';
export type { UISlice, ThemeMode, Notification } from './uiSlice';
export type {
  BulkOpsSlice,
  BulkOperation,
  BulkOperationResult,
  BulkOperationError,
  BulkOperationType,
  BulkOperationStatus,
} from './bulkOpsSlice';
