/**
 * Toast Notification System with React context.
 * Supports success, error, warning, info types with batching and auto-dismiss.
 * @see Task 8.2 - Toast/Notification System
 */

import React, {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

/** Toast types and their default durations */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  readonly label: string;
  readonly onClick: () => void;
}

export interface ToastOptions {
  readonly type: ToastType;
  readonly title: string;
  readonly description?: string;
  readonly action?: ToastAction;
  /** Custom duration in ms. Use 0 for persistent. */
  readonly duration?: number;
}

export interface Toast {
  readonly id: string;
  readonly type: ToastType;
  readonly title: string;
  readonly description?: string;
  readonly action?: ToastAction;
  readonly createdAt: number;
  /** Count of batched errors */
  readonly count?: number;
}

/** Default durations by type (ms) */
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 5000,
  error: 0, // persistent
  warning: 8000,
  info: 5000,
};

const MAX_VISIBLE_TOASTS = 5;
const BATCH_WINDOW_MS = 500;

// --- Reducer ---

type ToastState = readonly Toast[];

type ToastAction_Internal =
  | { type: 'ADD'; toast: Toast }
  | { type: 'DISMISS'; id: string }
  | { type: 'DISMISS_ALL' }
  | { type: 'BATCH_INCREMENT'; id: string };

function toastReducer(state: ToastState, action: ToastAction_Internal): ToastState {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast].slice(-MAX_VISIBLE_TOASTS);
    case 'DISMISS':
      return state.filter((t) => t.id !== action.id);
    case 'DISMISS_ALL':
      return [];
    case 'BATCH_INCREMENT':
      return state.map((t) =>
        t.id === action.id ? { ...t, count: (t.count ?? 1) + 1 } : t,
      );
    default:
      return state;
  }
}

// --- Context ---

export interface ToastContextValue {
  readonly toast: (options: ToastOptions) => string;
  readonly dismiss: (id: string) => void;
  readonly dismissAll: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

// --- Icons ---

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />,
  info: <Info className="h-5 w-5 text-blue-500" aria-hidden="true" />,
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-blue-500',
};

// --- Provider ---

interface ToastProviderProps {
  readonly children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps): React.JSX.Element {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastErrorRef = useRef<{ id: string; timestamp: number } | null>(null);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'DISMISS', id });
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismissAll = useCallback(() => {
    dispatch({ type: 'DISMISS_ALL' });
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    lastErrorRef.current = null;
  }, []);

  const toast = useCallback(
    (options: ToastOptions): string => {
      const { type, title, description, action, duration } = options;
      const now = Date.now();

      // Batch error notifications within the window
      if (type === 'error' && lastErrorRef.current) {
        const timeSinceLast = now - lastErrorRef.current.timestamp;
        if (timeSinceLast < BATCH_WINDOW_MS) {
          const existingId = lastErrorRef.current.id;
          dispatch({ type: 'BATCH_INCREMENT', id: existingId });
          lastErrorRef.current = { id: existingId, timestamp: now };
          return existingId;
        }
      }

      const id = `toast-${now}-${Math.random().toString(36).slice(2, 9)}`;

      const newToast: Toast = {
        id,
        type,
        title,
        description,
        action,
        createdAt: now,
        count: 1,
      };

      dispatch({ type: 'ADD', toast: newToast });

      if (type === 'error') {
        lastErrorRef.current = { id, timestamp: now };
      }

      // Auto-dismiss logic
      const autoDismissMs = duration ?? DEFAULT_DURATIONS[type];
      if (autoDismissMs > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, autoDismissMs);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss],
  );

  const contextValue = useMemo<ToastContextValue>(
    () => ({ toast, dismiss, dismissAll }),
    [toast, dismiss, dismissAll],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast container - bottom-right */}
      <div
        className="pointer-events-none fixed bottom-0 right-0 z-50 flex max-h-screen flex-col-reverse gap-2 p-4 sm:max-w-[420px]"
        aria-live="polite"
        aria-relevant="additions removals"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto w-full min-w-[320px] overflow-hidden rounded-lg border border-l-4 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 ${BORDER_COLORS[t.type]}`}
              role="status"
              aria-atomic="true"
            >
              <div className="flex items-start gap-3 p-4">
                <div className="flex-shrink-0 pt-0.5">{ICONS[t.type]}</div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t.title}
                    {t.count && t.count > 1 && (
                      <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300">
                        {t.count}
                      </span>
                    )}
                  </p>
                  {t.description && (
                    <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                      {t.description}
                    </p>
                  )}
                  {t.action && (
                    <button
                      type="button"
                      onClick={t.action.onClick}
                      className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t.action.label}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="flex-shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
