/**
 * Exams module route definitions.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const ExamsPage = React.lazy(() =>
  import('./pages/ExamsPage').then((m) => ({ default: m.ExamsPage }))
);

const ExamDetailPage = React.lazy(() =>
  import('./pages/ExamDetailPage').then((m) => ({ default: m.ExamDetailPage }))
);

const CompetitiveExamDetailPage = React.lazy(() =>
  import('./pages/CompetitiveExamDetailPage').then((m) => ({ default: m.CompetitiveExamDetailPage }))
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

export const examRoutes: RouteObject[] = [
  {
    path: 'exams',
    element: (
      <Suspense fallback={<PageFallback />}>
        <ExamsPage />
      </Suspense>
    ),
  },
  {
    path: 'exams/competitive/:id',
    element: (
      <Suspense fallback={<PageFallback />}>
        <CompetitiveExamDetailPage />
      </Suspense>
    ),
  },
  {
    path: 'exams/:id',
    element: (
      <Suspense fallback={<PageFallback />}>
        <ExamDetailPage />
      </Suspense>
    ),
  },
];
