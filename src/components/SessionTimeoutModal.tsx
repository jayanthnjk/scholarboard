/**
 * Session Timeout Modal - Warns users before session expiry with countdown.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Clock, LogOut, RefreshCw } from 'lucide-react';

interface SessionTimeoutModalProps {
  /** Whether the modal is visible */
  readonly isOpen: boolean;
  /** Remaining seconds before session expires */
  readonly initialSeconds: number;
  /** Called when user clicks "Extend Session" */
  readonly onExtend: () => void;
  /** Called when user clicks "Log Out" or countdown reaches 0 */
  readonly onLogout: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function SessionTimeoutModal({
  isOpen,
  initialSeconds,
  onExtend,
  onLogout,
}: SessionTimeoutModalProps): React.JSX.Element | null {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (isOpen) {
      setRemaining(initialSeconds);
    }
  }, [isOpen, initialSeconds]);

  useEffect(() => {
    if (!isOpen || remaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, remaining]);

  const handleTimeout = useCallback(() => {
    onLogout();
  }, [onLogout]);

  useEffect(() => {
    if (remaining === 0 && isOpen) {
      handleTimeout();
    }
  }, [remaining, isOpen, handleTimeout]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
    >
      <div className="mx-4 w-full max-w-sm rounded-lg border bg-card p-6 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
          <h2 id="session-timeout-title" className="mt-4 text-lg font-semibold">
            Session Expiring
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your session will expire due to inactivity.
          </p>
          <p className="mt-3 text-3xl font-bold tabular-nums" aria-live="polite" aria-atomic="true">
            {formatTime(remaining)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">remaining</p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onExtend}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Extend Session
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
