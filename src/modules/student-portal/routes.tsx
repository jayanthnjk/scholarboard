/**
 * Student Portal module route definitions with lazy loading.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const StudentDashboardPage = React.lazy(() =>
  import('./pages/StudentDashboardPage').then((m) => ({ default: m.StudentDashboardPage }))
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

export const studentPortalRoutes: RouteObject[] = [
  {
    path: 'student-portal',
    element: (
      <Suspense fallback={<PageFallback />}>
        <StudentDashboardPage />
      </Suspense>
    ),
  },
];
