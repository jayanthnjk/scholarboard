/**
 * Hierarchical query key factory for TanStack Query.
 * Provides type-safe, consistent cache key generation across the application.
 *
 * Key structure follows the pattern: [domain, tenantId, scope?, params?]
 * This enables granular cache invalidation at any level of the hierarchy.
 */

export interface StudentListParams {
  page: number;
  pageSize: number;
  search?: string;
  filters: {
    class?: string;
    section?: string;
    status?: string;
    admissionYear?: string;
  };
  sort?: { field: string; direction: 'asc' | 'desc' };
}

export interface PaymentListParams {
  page: number;
  pageSize: number;
  dateRange?: { start: string; end: string };
  studentId?: string;
  classId?: string;
  status?: string;
  method?: string;
  amountRange?: { min: number; max: number };
  receiptNumber?: string;
}

export const queryKeys = {
  students: {
    all: (tenantId: string) => ['students', tenantId] as const,
    list: (tenantId: string, params: StudentListParams) =>
      ['students', tenantId, 'list', params] as const,
    detail: (tenantId: string, id: string) =>
      ['students', tenantId, 'detail', id] as const,
    timeline: (tenantId: string, id: string) =>
      ['students', tenantId, 'timeline', id] as const,
  },
  fees: {
    all: (tenantId: string) => ['fees', tenantId] as const,
    structure: (tenantId: string, yearId: string) =>
      ['fees', tenantId, 'structure', yearId] as const,
    payments: (tenantId: string, params: PaymentListParams) =>
      ['fees', tenantId, 'payments', params] as const,
    defaulters: (tenantId: string) =>
      ['fees', tenantId, 'defaulters'] as const,
    analytics: (tenantId: string) =>
      ['fees', tenantId, 'analytics'] as const,
  },
  config: {
    tenant: (tenantId: string) => ['config', tenantId] as const,
    navigation: (tenantId: string, role: string) =>
      ['config', tenantId, 'navigation', role] as const,
    featureFlags: (tenantId: string) =>
      ['config', tenantId, 'flags'] as const,
  },
} as const;
