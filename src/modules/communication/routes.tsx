/**
 * Communication module route definitions.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const CommunicationPage = React.lazy(() =>
  import('./pages/CommunicationPage').then((m) => ({ default: m.CommunicationPage }))
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

export const communicationRoutes: RouteObject[] = [
  {
    path: 'communication',
    element: (
      <Suspense fallback={<PageFallback />}>
        <CommunicationPage />
      </Suspense>
    ),
  },
];
