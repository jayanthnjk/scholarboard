/**
 * Transport module route definitions.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const TransportPage = React.lazy(() =>
  import('./pages/TransportPage').then((m) => ({ default: m.TransportPage }))
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

export const transportRoutes: RouteObject[] = [
  {
    path: 'transport',
    element: (
      <Suspense fallback={<PageFallback />}>
        <TransportPage />
      </Suspense>
    ),
  },
];
