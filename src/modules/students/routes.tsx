/**
 * Student module route definitions with lazy loading.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const StudentListPage = React.lazy(() =>
  import('./pages/StudentListPage').then((m) => ({ default: m.StudentListPage }))
);

const StudentProfilePage = React.lazy(() =>
  import('./pages/StudentProfilePage').then((m) => ({ default: m.StudentProfilePage }))
);

const AdmissionFormPage = React.lazy(() =>
  import('./pages/AdmissionFormPage').then((m) => ({ default: m.AdmissionFormPage }))
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

export const studentRoutes: RouteObject[] = [
  {
    path: 'students',
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <StudentListPage />
          </Suspense>
        ),
      },
      {
        path: 'admission',
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdmissionFormPage />
          </Suspense>
        ),
      },
      {
        path: ':id',
        element: (
          <Suspense fallback={<PageFallback />}>
            <StudentProfilePage />
          </Suspense>
        ),
      },
    ],
  },
];
