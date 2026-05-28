/**
 * App Providers Composition - single entry point for wrapping the application.
 * Composes all providers in the correct dependency order:
 * QueryClientProvider → AuthProvider → TenantProvider → ThemeProvider → ConfigProvider
 * @see Requirements 14.1, 1.1, 12.2, 3.1
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/providers/AuthProvider';
import { TenantProvider } from '@/providers/TenantProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ConfigProvider } from '@/providers/ConfigProvider';
import { ToastProvider } from '@/components/toast';

/** TanStack Query client with sensible defaults */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface AppProvidersProps {
  readonly children: React.ReactNode;
}

/**
 * AppProviders composes all application-level providers in correct order.
 * Order matters - each provider may depend on data from its parents:
 *
 * 1. BrowserRouter - routing context (needed by AuthProvider for navigation)
 * 2. QueryClientProvider - data fetching layer
 * 3. AuthProvider - authentication state (needed by TenantProvider for API calls)
 * 4. TenantProvider - tenant configuration (needed by ThemeProvider for branding)
 * 5. ThemeProvider - theming and styling (uses tenant branding)
 * 6. ConfigProvider - navigation and features (uses tenant modules + user role)
 */
export function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <ThemeProvider>
              <ConfigProvider>
                <ToastProvider>{children}</ToastProvider>
              </ConfigProvider>
            </ThemeProvider>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

/** Export the query client for use in tests or prefetching */
export { queryClient };
