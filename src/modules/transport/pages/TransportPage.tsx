/**
 * Transport Module - Scaffold Page
 */

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus } from 'lucide-react';

export function TransportPage(): React.JSX.Element {
  return (
    <PageContent>
      <PageHeader
        title="Transport"
        subtitle="Manage bus routes, vehicles, and student transport."
        breadcrumbs={[{ label: 'Home' }, { label: 'Transport' }]}
      />

      <div className="mt-6 flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center shadow-sm">
        <div className="rounded-full bg-primary/10 p-4">
          <Bus className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Transport Module</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Route planning, GPS tracking, driver management, bus allocation, and transport fee collection.
        </p>
        <span className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          Coming Soon
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
            <Skeleton height={16} width="60%" />
            <Skeleton height={12} width="80%" className="mt-2" />
            <Skeleton height={40} className="mt-4" />
          </div>
        ))}
      </div>
    </PageContent>
  );
}
