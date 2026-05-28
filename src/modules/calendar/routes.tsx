/**
 * Calendar module route definitions with lazy loading.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const CalendarPage = React.lazy(() =>
  import('./pages/CalendarPage').then((m) => ({ default: m.CalendarPage }))
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

export const calendarRoutes: RouteObject[] = [
  {
    path: 'calendar',
    element: (
      <Suspense fallback={<PageFallback />}>
        <CalendarPage />
      </Suspense>
    ),
  },
];
