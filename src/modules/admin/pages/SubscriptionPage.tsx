/**
 * Subscription & Billing Page - Plan management and billing for super admin.
 */

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { CreditCard, TrendingUp } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: string;
  interval: string;
  tenantCount: number;
  features: string;
}

interface BillingRecord {
  id: string;
  tenant: string;
  plan: string;
  amount: string;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

const PLANS: Plan[] = [
  { id: '1', name: 'Free', price: '₹0', interval: 'forever', tenantCount: 5, features: '3 modules, 50 users' },
  { id: '2', name: 'Basic', price: '₹2,999', interval: '/month', tenantCount: 12, features: '6 modules, 200 users' },
  { id: '3', name: 'Pro', price: '₹7,999', interval: '/month', tenantCount: 18, features: 'All modules, 500 users' },
  { id: '4', name: 'Enterprise', price: '₹19,999', interval: '/month', tenantCount: 7, features: 'Unlimited, custom SLA' },
];

const BILLING_HISTORY: BillingRecord[] = [
  { id: '1', tenant: 'Springfield Academy', plan: 'Pro', amount: '₹7,999', date: '2024-03-01', status: 'paid' },
  { id: '2', tenant: 'Riverside School', plan: 'Enterprise', amount: '₹19,999', date: '2024-03-01', status: 'paid' },
  { id: '3', tenant: 'Oakwood International', plan: 'Basic', amount: '₹2,999', date: '2024-03-05', status: 'pending' },
  { id: '4', tenant: 'Greenfield Public', plan: 'Pro', amount: '₹7,999', date: '2024-02-28', status: 'overdue' },
];

const BILLING_STATUS_STYLES: Record<BillingRecord['status'], string> = {
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const planColumns: ColumnDef<Plan, unknown>[] = [
  { accessorKey: 'name', header: 'Plan' },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => (
      <span className="font-semibold">
        {row.original.price}<span className="text-xs text-muted-foreground">{row.original.interval}</span>
      </span>
    ),
  },
  { accessorKey: 'tenantCount', header: 'Active Tenants' },
  { accessorKey: 'features', header: 'Includes' },
];

const billingColumns: ColumnDef<BillingRecord, unknown>[] = [
  { accessorKey: 'tenant', header: 'Tenant' },
  { accessorKey: 'plan', header: 'Plan' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'date', header: 'Date' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${BILLING_STATUS_STYLES[row.original.status]}`}>
        {row.original.status}
      </span>
    ),
  },
];

export function SubscriptionPage(): React.JSX.Element {
  return (
    <PageContent>
      <PageHeader
        title="Subscriptions & Billing"
        subtitle="Manage plans, billing, and usage across tenants."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Subscriptions' }]}
      />

      {/* Usage Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            Monthly Revenue
          </div>
          <p className="mt-2 text-2xl font-bold">₹2,18,965</p>
          <p className="mt-1 text-xs text-emerald-600">+14% vs last month</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Total Subscriptions
          </div>
          <p className="mt-2 text-2xl font-bold">42</p>
          <p className="mt-1 text-xs text-muted-foreground">37 paid, 5 free</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            Overdue Invoices
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">3</p>
          <p className="mt-1 text-xs text-muted-foreground">₹23,997 outstanding</p>
        </div>
      </div>

      {/* Plans Table */}
      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold">Plan Management</h3>
        <DataTable
          columns={planColumns}
          data={PLANS}
          getRowId={(row) => row.id}
          emptyStateMessage="No plans configured"
        />
      </div>

      {/* Billing History */}
      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold">Recent Billing History</h3>
        <DataTable
          columns={billingColumns}
          data={BILLING_HISTORY}
          getRowId={(row) => row.id}
          searchPlaceholder="Search billing records..."
          emptyStateMessage="No billing records"
        />
      </div>
    </PageContent>
  );
}
