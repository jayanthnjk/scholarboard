/**
 * Fee module route definitions with lazy loading.
 */

import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const FeesOverviewPage = React.lazy(() =>
  import('./pages/FeesOverviewPage').then((m) => ({ default: m.FeesOverviewPage }))
);

const FeeStructurePage = React.lazy(() =>
  import('./pages/FeeStructurePage').then((m) => ({ default: m.FeeStructurePage }))
);

const PaymentHistoryPage = React.lazy(() =>
  import('./pages/PaymentHistoryPage').then((m) => ({ default: m.PaymentHistoryPage }))
);

const PaymentFormPage = React.lazy(() =>
  import('./pages/PaymentFormPage').then((m) => ({ default: m.PaymentFormPage }))
);

const DefaultersPage = React.lazy(() =>
  import('./pages/DefaultersPage').then((m) => ({ default: m.DefaultersPage }))
);

const AnalyticsPage = React.lazy(() =>
  import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);

const MakePaymentPage = React.lazy(() =>
  import('./pages/MakePaymentPage').then((m) => ({ default: m.MakePaymentPage }))
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

export const feeRoutes: RouteObject[] = [
  {
    path: 'fees',
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <FeesOverviewPage />
          </Suspense>
        ),
      },
      {
        path: 'structure',
        element: (
          <Suspense fallback={<PageFallback />}>
            <FeeStructurePage />
          </Suspense>
        ),
      },
      {
        path: 'payments',
        element: (
          <Suspense fallback={<PageFallback />}>
            <PaymentHistoryPage />
          </Suspense>
        ),
      },
      {
        path: 'payments/new',
        element: (
          <Suspense fallback={<PageFallback />}>
            <PaymentFormPage />
          </Suspense>
        ),
      },
      {
        path: 'defaulters',
        element: (
          <Suspense fallback={<PageFallback />}>
            <DefaultersPage />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<PageFallback />}>
            <AnalyticsPage />
          </Suspense>
        ),
      },
      {
        path: 'make-payment',
        element: (
          <Suspense fallback={<PageFallback />}>
            <MakePaymentPage />
          </Suspense>
        ),
      },
    ],
  },
];
