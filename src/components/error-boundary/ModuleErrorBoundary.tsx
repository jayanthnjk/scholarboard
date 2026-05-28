/**
 * Module-level Error Boundary for catching render errors within ERP modules.
 * Provides fallback UI with error description, retry, and report actions.
 * @see Task 8.1 - Error Boundaries
 */

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

interface ModuleErrorBoundaryProps {
  readonly children: React.ReactNode;
  /** Module name for error context */
  readonly moduleName?: string;
  /** Custom fallback renderer */
  readonly fallback?: (props: FallbackProps) => React.ReactNode;
  /** Callback when an error is caught */
  readonly onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface FallbackProps {
  readonly error: Error;
  readonly resetError: () => void;
}

interface ModuleErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class ModuleErrorBoundary extends Component<
  ModuleErrorBoundaryProps,
  ModuleErrorBoundaryState
> {
  constructor(props: ModuleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[ModuleErrorBoundary]', error, errorInfo);
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  private handleReport = (): void => {
    const { error } = this.state;
    const { moduleName } = this.props;

    // Open mailto or integrate with error reporting service
    const subject = encodeURIComponent(
      `Bug Report: ${moduleName ?? 'Unknown Module'} - ${error?.message ?? 'Unknown Error'}`,
    );
    const body = encodeURIComponent(
      `Error: ${error?.message ?? 'Unknown'}\n\nStack: ${error?.stack ?? 'N/A'}\n\nModule: ${moduleName ?? 'Unknown'}\n\nTimestamp: ${new Date().toISOString()}`,
    );
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, moduleName } = this.props;

    if (!hasError || !error) {
      return children;
    }

    if (fallback) {
      return fallback({ error, resetError: this.handleReset });
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 dark:border-red-900 dark:bg-red-950/30"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {moduleName ? `${moduleName} encountered an error` : 'Something went wrong'}
        </h2>

        <p className="mt-2 max-w-md text-center text-sm text-gray-600 dark:text-gray-400">
          {error.message || 'An unexpected error occurred while rendering this module.'}
        </p>

        {import.meta.env.DEV && error.stack && (
          <details className="mt-4 w-full max-w-lg">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              Stack trace (dev only)
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-3 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>

          <button
            type="button"
            onClick={this.handleReport}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Bug className="h-4 w-4" aria-hidden="true" />
            Report Issue
          </button>
        </div>
      </motion.div>
    );
  }
}
