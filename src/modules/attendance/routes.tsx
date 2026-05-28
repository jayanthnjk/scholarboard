/**
 * Attendance module route definitions.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const AttendancePage = React.lazy(() =>
  import('./pages/AttendancePage').then((m) => ({ default: m.AttendancePage }))
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

export const attendanceRoutes: RouteObject[] = [
  {
    path: 'attendance',
    element: (
      <Suspense fallback={<PageFallback />}>
        <AttendancePage />
      </Suspense>
    ),
  },
];
