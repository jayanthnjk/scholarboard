/**
 * Bulk operations slice for Zustand store.
 * Manages active bulk operations (import, export, promotion) and their history.
 * @see Requirements 12.2
 */

import type { StateCreator } from 'zustand';

export type BulkOperationType = 'import' | 'export' | 'promotion' | 'transfer' | 'delete';
export type BulkOperationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface BulkOperation {
  id: string;
  type: BulkOperationType;
  status: BulkOperationStatus;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  startedAt: string;
  description: string;
}

export interface BulkOperationResult {
  id: string;
  type: BulkOperationType;
  status: 'completed' | 'failed' | 'cancelled';
  totalItems: number;
  successCount: number;
  failureCount: number;
  errors: readonly BulkOperationError[];
  startedAt: string;
  completedAt: string;
}

export interface BulkOperationError {
  row: number;
  field?: string;
  message: string;
}

export interface BulkOpsSlice {
  bulkOps: {
    activeOperations: readonly BulkOperation[];
    history: readonly BulkOperationResult[];
  };
  addBulkOperation: (operation: BulkOperation) => void;
  updateBulkOperation: (id: string, update: Partial<BulkOperation>) => void;
  removeBulkOperation: (id: string) => void;
  completeBulkOperation: (result: BulkOperationResult) => void;
  clearBulkOpsHistory: () => void;
}

export const createBulkOpsSlice: StateCreator<BulkOpsSlice, [], [], BulkOpsSlice> = (set) => ({
  bulkOps: {
    activeOperations: [],
    history: [],
  },
  addBulkOperation: (operation) =>
    set((state) => ({
      bulkOps: {
        ...state.bulkOps,
        activeOperations: [...state.bulkOps.activeOperations, operation],
      },
    })),
  updateBulkOperation: (id, update) =>
    set((state) => ({
      bulkOps: {
        ...state.bulkOps,
        activeOperations: state.bulkOps.activeOperations.map((op) =>
          op.id === id ? { ...op, ...update } : op,
        ),
      },
    })),
  removeBulkOperation: (id) =>
    set((state) => ({
      bulkOps: {
        ...state.bulkOps,
        activeOperations: state.bulkOps.activeOperations.filter((op) => op.id !== id),
      },
    })),
  completeBulkOperation: (result) =>
    set((state) => ({
      bulkOps: {
        activeOperations: state.bulkOps.activeOperations.filter((op) => op.id !== result.id),
        history: [result, ...state.bulkOps.history],
      },
    })),
  clearBulkOpsHistory: () =>
    set((state) => ({
      bulkOps: { ...state.bulkOps, history: [] },
    })),
});
