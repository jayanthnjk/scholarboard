/**
 * Student module API hooks using TanStack Query.
 * All requests go through the apiRequest pipeline (queue, circuit breaker, retry).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/services/api-client';
import type {
  StudentRecord,
  StudentListParams,
  PaginatedResponse,
  BulkImportResult,
  BulkExportOptions,
  AdmissionFormData,
} from './types';

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (params: StudentListParams) => [...studentKeys.lists(), params] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
} as const;

// ─── Query Hooks ────────────────────────────────────────────────────────────

/**
 * Fetches paginated student list with filters, sorting, and search.
 */
export function useStudentList(params: StudentListParams) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () =>
      get<PaginatedResponse<StudentRecord>>('/students', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search || undefined,
          sortField: params.sortField || undefined,
          sortDirection: params.sortDirection || undefined,
          class: params.filters?.className || undefined,
          section: params.filters?.section || undefined,
          status: params.filters?.status || undefined,
          admissionYear: params.filters?.admissionYear || undefined,
        },
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}

/**
 * Fetches a single student profile by ID.
 */
export function useStudentProfile(id: string | undefined) {
  return useQuery({
    queryKey: studentKeys.detail(id ?? ''),
    queryFn: async () => {
      const response = await get<{ data: StudentRecord }>(`/students/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60_000,
  });
}

// ─── Mutation Hooks ─────────────────────────────────────────────────────────

/**
 * Creates a new student (admission).
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdmissionFormData) =>
      post<StudentRecord>('/students', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

/**
 * Updates an existing student profile.
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StudentRecord> }) =>
      put<StudentRecord>(`/students/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

/**
 * Deletes a student record.
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => del<void>(`/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

/**
 * Bulk import students from file.
 */
export function useBulkImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return post<BulkImportResult>('/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

/**
 * Bulk export students.
 */
export function useBulkExport() {
  return useMutation({
    mutationFn: (options: BulkExportOptions) =>
      post<Blob>('/students/export', options, {
        responseType: 'blob',
      }),
  });
}
