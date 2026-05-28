/**
 * Staff module route definitions.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const StaffPage = React.lazy(() =>
  import('./pages/StaffPage').then((m) => ({ default: m.StaffPage }))
);

const FacultyProfilePage = React.lazy(() =>
  import('./pages/FacultyProfilePage').then((m) => ({ default: m.FacultyProfilePage }))
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

export const staffRoutes: RouteObject[] = [
  {
    path: 'staff',
    element: (
      <Suspense fallback={<PageFallback />}>
        <StaffPage />
      </Suspense>
    ),
  },
  {
    path: 'staff/:id',
    element: (
      <Suspense fallback={<PageFallback />}>
        <FacultyProfilePage />
      </Suspense>
    ),
  },
];
