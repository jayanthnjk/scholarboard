/**
 * Admin module route definitions with lazy loading.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const TenantManagementPage = React.lazy(() =>
  import('./pages/TenantManagementPage').then((m) => ({ default: m.TenantManagementPage }))
);

const PlatformAnalyticsPage = React.lazy(() =>
  import('./pages/PlatformAnalyticsPage').then((m) => ({ default: m.PlatformAnalyticsPage }))
);

const SubscriptionPage = React.lazy(() =>
  import('./pages/SubscriptionPage').then((m) => ({ default: m.SubscriptionPage }))
);

function PageFallback() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton height={32} width="40%" />
      <Skeleton height={16} width="60%" />
      <Skeleton height={400} />
    </div>
  );
}

export const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <TenantManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'tenants',
        element: (
          <Suspense fallback={<PageFallback />}>
            <TenantManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<PageFallback />}>
            <PlatformAnalyticsPage />
          </Suspense>
        ),
      },
      {
        path: 'subscriptions',
        element: (
          <Suspense fallback={<PageFallback />}>
            <SubscriptionPage />
          </Suspense>
        ),
      },
    ],
  },
];
