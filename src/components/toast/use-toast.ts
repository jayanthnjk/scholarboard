/**
 * Hook for accessing the toast notification system.
 * @see Task 8.2 - Toast/Notification System
 */

import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from './toast-provider';

/**
 * useToast provides access to the toast notification system.
 * Must be used within a ToastProvider.
 *
 * @example
 * ```tsx
 * const { toast, dismiss, dismissAll } = useToast();
 *
 * toast({ type: 'success', title: 'Record saved!' });
 * toast({ type: 'error', title: 'Failed', description: 'Check your connection.' });
 * ```
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
