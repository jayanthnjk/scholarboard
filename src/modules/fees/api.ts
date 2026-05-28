/**
 * Fee module API hooks using TanStack Query.
 * All requests go through the apiRequest pipeline (queue, circuit breaker, retry).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/services/api-client';
import type {
  FeeStructure,
  PaymentRecord,
  FeeDefaulter,
  FeeAnalytics,
  FeeListParams,
  PaymentFormData,
  FeeStructureFormData,
  PaginatedResponse,
} from './types';

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const feeKeys = {
  all: ['fees'] as const,
  structures: () => [...feeKeys.all, 'structures'] as const,
  payments: () => [...feeKeys.all, 'payments'] as const,
  paymentList: (params: FeeListParams) => [...feeKeys.payments(), params] as const,
  defaulters: () => [...feeKeys.all, 'defaulters'] as const,
  defaulterList: (params: FeeListParams) => [...feeKeys.defaulters(), params] as const,
  analytics: () => [...feeKeys.all, 'analytics'] as const,
} as const;

// ─── Query Hooks ────────────────────────────────────────────────────────────

/**
 * Fetches all fee structures for the current tenant.
 */
export function useFeeStructures() {
  return useQuery({
    queryKey: feeKeys.structures(),
    queryFn: () => get<FeeStructure[]>('/fees/structure'),
    staleTime: 60_000,
  });
}

/**
 * Fetches paginated payment history with filters.
 */
export function usePaymentHistory(params: FeeListParams) {
  return useQuery({
    queryKey: feeKeys.paymentList(params),
    queryFn: () =>
      get<PaginatedResponse<PaymentRecord>>('/fees/payments', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search || undefined,
          sortField: params.sortField || undefined,
          sortDirection: params.sortDirection || undefined,
          status: params.filters?.status || undefined,
          method: params.filters?.method || undefined,
          class: params.filters?.className || undefined,
          dateFrom: params.filters?.dateFrom || undefined,
          dateTo: params.filters?.dateTo || undefined,
        },
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}

/**
 * Fetches fee defaulters list with pagination.
 */
export function useFeeDefaulters(params: FeeListParams) {
  return useQuery({
    queryKey: feeKeys.defaulterList(params),
    queryFn: () =>
      get<PaginatedResponse<FeeDefaulter>>('/fees/defaulters', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search || undefined,
          sortField: params.sortField || undefined,
          sortDirection: params.sortDirection || undefined,
        },
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}

/**
 * Fetches fee analytics data.
 */
export function useFeeAnalytics() {
  return useQuery({
    queryKey: feeKeys.analytics(),
    queryFn: () => get<FeeAnalytics>('/fees/analytics'),
    staleTime: 120_000,
  });
}

// ─── Mutation Hooks ─────────────────────────────────────────────────────────

/**
 * Process a fee payment.
 */
export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PaymentFormData) =>
      post<PaymentRecord>('/fees/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.payments() });
      queryClient.invalidateQueries({ queryKey: feeKeys.defaulters() });
      queryClient.invalidateQueries({ queryKey: feeKeys.analytics() });
    },
  });
}

/**
 * Create a new fee structure.
 */
export function useCreateFeeStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FeeStructureFormData) =>
      post<FeeStructure>('/fees/structure', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.structures() });
    },
  });
}

/**
 * Send a payment reminder to a defaulter.
 */
export function useSendReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (defaulterId: string) =>
      post<{ success: boolean }>(`/fees/defaulters/${defaulterId}/remind`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.defaulters() });
    },
  });
}
