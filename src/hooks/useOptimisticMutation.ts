/**
 * Generic optimistic mutation hook wrapping TanStack Query useMutation.
 * Applies optimistic state immediately, rolls back on error with toast notification.
 * @see Task 8.3 - Optimistic Update Hook
 */

import { useCallback, useRef } from 'react';
import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { useToast } from '@/components/toast/use-toast';

interface OptimisticMutationOptions<TData, TVariables, TContext = unknown> {
  /** The mutation function */
  readonly mutationFn: (variables: TVariables) => Promise<TData>;
  /** Query key(s) to update optimistically */
  readonly queryKey: QueryKey;
  /** Function to apply optimistic update to cached data */
  readonly optimisticUpdate: (currentData: TData | undefined, variables: TVariables) => TData;
  /** Optional callback on success */
  readonly onSuccess?: (data: TData, variables: TVariables) => void;
  /** Optional callback on error */
  readonly onError?: (error: Error, variables: TVariables) => void;
  /** Optional custom error message */
  readonly errorMessage?: string;
  /** Optional undo handler for rollback notification */
  readonly onUndo?: (variables: TVariables) => void;
  /** Additional TanStack Query mutation options */
  readonly mutationOptions?: Omit<
    UseMutationOptions<TData, Error, TVariables, TContext>,
    'mutationFn' | 'onMutate' | 'onError' | 'onSuccess' | 'onSettled'
  >;
}

interface OptimisticMutationResult<TData, TVariables> {
  /** The mutation result from TanStack Query */
  readonly mutation: UseMutationResult<TData, Error, TVariables, { previousData: TData | undefined }>;
  /** Execute the mutation (prevents duplicates while pending) */
  readonly mutate: (variables: TVariables) => void;
  /** Whether the mutation is currently in progress */
  readonly isPending: boolean;
}

/**
 * useOptimisticMutation wraps TanStack Query's useMutation with optimistic updates.
 *
 * @example
 * ```ts
 * const { mutate, isPending } = useOptimisticMutation({
 *   mutationFn: (data) => api.updateRecord(data),
 *   queryKey: ['records'],
 *   optimisticUpdate: (current, variables) => {
 *     return current?.map(r => r.id === variables.id ? { ...r, ...variables } : r);
 *   },
 * });
 * ```
 */
export function useOptimisticMutation<TData, TVariables>(
  options: OptimisticMutationOptions<TData, TVariables>,
): OptimisticMutationResult<TData, TVariables> {
  const {
    mutationFn,
    queryKey,
    optimisticUpdate,
    onSuccess,
    onError,
    errorMessage,
    onUndo,
    mutationOptions,
  } = options;

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isPendingRef = useRef(false);

  const mutation = useMutation<TData, Error, TVariables, { previousData: TData | undefined }>({
    ...mutationOptions,
    mutationFn,

    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous data
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Apply optimistic update
      const optimisticData = optimisticUpdate(previousData, variables);
      queryClient.setQueryData<TData>(queryKey, optimisticData);

      isPendingRef.current = true;
      return { previousData };
    },

    onSuccess: (data, variables) => {
      isPendingRef.current = false;
      onSuccess?.(data, variables);
    },

    onError: (error, variables, context) => {
      isPendingRef.current = false;

      // Rollback to previous state
      if (context?.previousData !== undefined) {
        queryClient.setQueryData<TData>(queryKey, context.previousData);
      }

      // Show error toast with optional undo
      const toastOptions = {
        type: 'error' as const,
        title: errorMessage ?? 'Action failed',
        description: error.message || 'Please try again.',
        action: onUndo
          ? {
              label: 'Undo',
              onClick: () => onUndo(variables),
            }
          : undefined,
      };

      toast(toastOptions);
      onError?.(error, variables);
    },

    onSettled: () => {
      isPendingRef.current = false;
      // Invalidate to refetch latest data
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  // Prevent duplicate submissions
  const mutate = useCallback(
    (variables: TVariables) => {
      if (isPendingRef.current || mutation.isPending) return;
      mutation.mutate(variables);
    },
    [mutation],
  );

  return {
    mutation,
    mutate,
    isPending: mutation.isPending,
  };
}
