/**
 * Offline Banner - Fixed bottom banner displayed when the user is offline.
 */

import React, { useState } from 'react';
import { WifiOff, X } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner(): React.JSX.Element | null {
  const { isOnline } = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline || dismissed) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-amber-600 px-4 py-3 text-white shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0" />
        <p className="text-sm font-medium">
          You&apos;re offline. Changes will sync when connected.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-1 hover:bg-white/20"
        aria-label="Dismiss offline notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
