/**
 * Reports module route definitions.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const ReportsPage = React.lazy(() =>
  import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);

const ReportDetailPage = React.lazy(() =>
  import('./pages/ReportDetailPage').then((m) => ({ default: m.ReportDetailPage }))
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

export const reportRoutes: RouteObject[] = [
  {
    path: 'reports',
    element: (
      <Suspense fallback={<PageFallback />}>
        <ReportsPage />
      </Suspense>
    ),
  },
  {
    path: 'reports/:id',
    element: (
      <Suspense fallback={<PageFallback />}>
        <ReportDetailPage />
      </Suspense>
    ),
  },
];
