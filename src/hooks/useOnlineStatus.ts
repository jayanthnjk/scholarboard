/**
 * Hook for detecting online/offline network status.
 * Uses navigator.onLine + online/offline events for real-time updates.
 * @see Task 8.4 - Offline Detection
 */

import { useEffect, useRef, useSyncExternalStore } from 'react';

interface OnlineStatus {
  /** Whether the browser is currently online */
  readonly isOnline: boolean;
  /** Timestamp of the last time the browser was confirmed online */
  readonly lastOnlineAt: Date | null;
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  // Assume online during SSR
  return true;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);

  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

/**
 * useOnlineStatus provides real-time online/offline detection.
 *
 * @example
 * ```tsx
 * const { isOnline, lastOnlineAt } = useOnlineStatus();
 *
 * if (!isOnline) {
 *   return <OfflineBanner lastOnline={lastOnlineAt} />;
 * }
 * ```
 */
export function useOnlineStatus(): OnlineStatus {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const lastOnlineAtRef = useRef<Date | null>(isOnline ? new Date() : null);

  useEffect(() => {
    if (isOnline) {
      lastOnlineAtRef.current = new Date();
    }
  }, [isOnline]);

  return {
    isOnline,
    lastOnlineAt: lastOnlineAtRef.current,
  };
}
