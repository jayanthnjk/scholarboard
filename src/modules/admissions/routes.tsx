/**
 * Admissions module route definitions.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const AdmissionPipelinePage = React.lazy(() =>
  import('./pages/AdmissionPipelinePage').then((m) => ({ default: m.AdmissionPipelinePage }))
);

const EnquiryDetailPage = React.lazy(() =>
  import('./pages/EnquiryDetailPage').then((m) => ({ default: m.EnquiryDetailPage }))
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

export const admissionRoutes: RouteObject[] = [
  {
    path: 'admissions',
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdmissionPipelinePage />
          </Suspense>
        ),
      },
      {
        path: 'pipeline',
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdmissionPipelinePage />
          </Suspense>
        ),
      },
      {
        path: ':id',
        element: (
          <Suspense fallback={<PageFallback />}>
            <EnquiryDetailPage />
          </Suspense>
        ),
      },
    ],
  },
];
