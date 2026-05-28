/**
 * Documents module route definitions with lazy loading.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const DocumentVaultPage = React.lazy(() =>
  import('./pages/DocumentVaultPage').then((m) => ({ default: m.DocumentVaultPage }))
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

export const documentRoutes: RouteObject[] = [
  {
    path: 'documents',
    element: (
      <Suspense fallback={<PageFallback />}>
        <DocumentVaultPage />
      </Suspense>
    ),
  },
];
