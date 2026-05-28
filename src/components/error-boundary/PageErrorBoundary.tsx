/**
 * Page-level Error Boundary for catching render errors within individual pages.
 * Lighter fallback than ModuleErrorBoundary with retry + go back actions.
 * @see Task 8.1 - Error Boundaries
 */

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface PageErrorBoundaryProps {
  readonly children: React.ReactNode;
  /** Optional page name for error context */
  readonly pageName?: string;
  /** Callback when an error is caught */
  readonly onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface PageErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class PageErrorBoundary extends Component<
  PageErrorBoundaryProps,
  PageErrorBoundaryState
> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);

    if (import.meta.env.DEV) {
      console.error('[PageErrorBoundary]', error, errorInfo);
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoBack = (): void => {
    window.history.back();
  };

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, pageName } = this.props;

    if (!hasError || !error) {
      return children;
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex min-h-[200px] flex-col items-center justify-center rounded-md border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/20"
        role="alert"
        aria-live="polite"
      >
        <AlertCircle className="h-10 w-10 text-amber-500 dark:text-amber-400" aria-hidden="true" />

        <h3 className="mt-3 text-base font-medium text-gray-900 dark:text-gray-100">
          {pageName ? `Error loading ${pageName}` : 'Page failed to load'}
        </h3>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {error.message || 'An unexpected error occurred.'}
        </p>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:bg-amber-700 dark:hover:bg-amber-600"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Retry
          </button>

          <button
            type="button"
            onClick={this.handleGoBack}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Go Back
          </button>
        </div>
      </motion.div>
    );
  }
}
