/**
 * Workflows module route definitions with lazy loading.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const WorkflowListPage = React.lazy(() =>
  import('./pages/WorkflowListPage').then((m) => ({ default: m.WorkflowListPage }))
);

const ApprovalInboxPage = React.lazy(() =>
  import('./pages/ApprovalInboxPage').then((m) => ({ default: m.ApprovalInboxPage }))
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

export const workflowRoutes: RouteObject[] = [
  {
    path: 'workflows',
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <WorkflowListPage />
          </Suspense>
        ),
      },
      {
        path: 'approvals',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ApprovalInboxPage />
          </Suspense>
        ),
      },
    ],
  },
];
