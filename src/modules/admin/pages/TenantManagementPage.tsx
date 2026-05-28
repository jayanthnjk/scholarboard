/**
 * Tenant Management Page - Super Admin console for managing tenants.
 */

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Building2, Plus, MoreHorizontal } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'trial';
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  userCount: number;
  createdAt: string;
}

const STATUS_STYLES: Record<Tenant['status'], string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  trial: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

const PLAN_STYLES: Record<Tenant['plan'], string> = {
  free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  basic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pro: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  enterprise: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const MOCK_TENANTS: Tenant[] = [
  { id: '1', name: 'Springfield Academy', domain: 'springfield.eduerp.io', status: 'active', plan: 'pro', userCount: 145, createdAt: '2024-01-15' },
  { id: '2', name: 'Riverside School', domain: 'riverside.eduerp.io', status: 'active', plan: 'enterprise', userCount: 320, createdAt: '2023-11-20' },
  { id: '3', name: 'Oakwood International', domain: 'oakwood.eduerp.io', status: 'trial', plan: 'basic', userCount: 28, createdAt: '2024-03-01' },
  { id: '4', name: 'Hilltop Prep', domain: 'hilltop.eduerp.io', status: 'suspended', plan: 'free', userCount: 0, createdAt: '2024-02-10' },
  { id: '5', name: 'Greenfield Public', domain: 'greenfield.eduerp.io', status: 'active', plan: 'pro', userCount: 210, createdAt: '2023-09-05' },
];

function TenantActions({ tenant }: { readonly tenant: Tenant }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded p-1 hover:bg-accent"
        aria-label={`Actions for ${tenant.name}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border bg-popover p-1 shadow-md">
          {tenant.status !== 'suspended' && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded px-3 py-1.5 text-left text-sm hover:bg-accent"
            >
              Suspend
            </button>
          )}
          {tenant.status === 'suspended' && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded px-3 py-1.5 text-left text-sm hover:bg-accent"
            >
              Activate
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full rounded px-3 py-1.5 text-left text-sm hover:bg-accent"
          >
            Configure
          </button>
        </div>
      )}
    </div>
  );
}

const columns: ColumnDef<Tenant, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Tenant Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.domain}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[row.original.status]}`}>
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ row }) => (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PLAN_STYLES[row.original.plan]}`}>
        {row.original.plan}
      </span>
    ),
  },
  {
    accessorKey: 'userCount',
    header: 'Users',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <TenantActions tenant={row.original} />,
    enableSorting: false,
    enableColumnFilter: false,
  },
];

export function TenantManagementPage(): React.JSX.Element {
  return (
    <PageContent>
      <PageHeader
        title="Tenant Management"
        subtitle="Manage all tenants on the platform."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Tenants' }]}
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Tenant
          </button>
        }
      />
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={MOCK_TENANTS}
          getRowId={(row) => row.id}
          searchPlaceholder="Search tenants..."
          emptyStateMessage="No tenants found"
        />
      </div>
    </PageContent>
  );
}
