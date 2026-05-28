/**
 * Courses module route definitions.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const CoursesPage = React.lazy(() =>
  import('./pages/CoursesPage').then((m) => ({ default: m.CoursesPage }))
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

export const coursesRoutes: RouteObject[] = [
  {
    path: 'courses',
    element: (
      <Suspense fallback={<PageFallback />}>
        <CoursesPage />
      </Suspense>
    ),
  },
];
