/**
 * Fee Defaulters page - DataTable of defaulters with aging columns and reminders.
 */

import { useState, useCallback } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable } from '@/components/ui/data-table';
import { usePermission } from '@/hooks/usePermission';
import { useToast } from '@/components/toast/use-toast';
import { useFeeDefaulters, useSendReminder } from '../api';
import type { FeeDefaulter, FeeListParams } from '../types';
import { AlertTriangle, DollarSign, Users, Bell } from 'lucide-react';

function DefaultersPage() {
  const { toast } = useToast();
  const { hasPermission } = usePermission();
  const sendReminder = useSendReminder();

  const [params, setParams] = useState<FeeListParams>({
    page: 1,
    pageSize: 20,
  });

  const { data, isLoading } = useFeeDefaulters(params);

  const handlePageChange = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setParams((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const handleSortChange = useCallback((sort: { field: string; direction: 'asc' | 'desc' } | null) => {
    setParams((prev) => ({
      ...prev,
      sortField: sort?.field,
      sortDirection: sort?.direction,
      page: 1,
    }));
  }, []);

  const handleSendReminder = async (defaulter: FeeDefaulter) => {
    try {
      await sendReminder.mutateAsync(defaulter.id);
      toast({ type: 'success', title: `Reminder sent to ${defaulter.parentName}` });
    } catch {
      toast({ type: 'error', title: 'Failed to send reminder' });
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const getAgingBadge = (days: number) => {
    if (days >= 90) return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
    if (days >= 60) return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300';
    if (days >= 30) return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300';
  };

  const columns: ColumnDef<FeeDefaulter, unknown>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.studentName}</p>
          <p className="text-xs text-muted-foreground">
            Class {row.original.className} - {row.original.section}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'pendingAmount',
      header: 'Pending Amount',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-destructive">{formatCurrency(row.original.pendingAmount)}</p>
          <p className="text-xs text-muted-foreground">
            of {formatCurrency(row.original.totalDue)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'daysOverdue',
      header: 'Overdue',
      cell: ({ row }) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getAgingBadge(row.original.daysOverdue)}`}>
          {row.original.daysOverdue} days
        </span>
      ),
    },
    {
      accessorKey: 'penaltyAccrued',
      header: 'Penalty',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
          {formatCurrency(row.original.penaltyAccrued)}
        </span>
      ),
    },
    {
      accessorKey: 'parentName',
      header: 'Parent Contact',
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.parentName}</p>
          <p className="text-xs text-muted-foreground">{row.original.contactPhone}</p>
        </div>
      ),
    },
    {
      accessorKey: 'remindersSent',
      header: 'Reminders',
      cell: ({ row }) => (
        <div className="text-center">
          <span className="text-sm font-medium">{row.original.remindersSent}</span>
          {row.original.lastReminderDate && (
            <p className="text-xs text-muted-foreground">
              Last: {new Date(row.original.lastReminderDate).toLocaleDateString('en-IN')}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        hasPermission('fees', 'collect') ? (
          <button
            type="button"
            onClick={() => handleSendReminder(row.original)}
            disabled={sendReminder.isPending}
            className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
            aria-label={`Send reminder to ${row.original.parentName}`}
          >
            <Bell className="h-3.5 w-3.5" />
            Remind
          </button>
        ) : null
      ),
      enableSorting: false,
    },
  ];

  // Summary stats
  const defaulters = data?.data ?? [];
  const totalDefaulters = data?.pagination.total ?? 0;
  const totalPendingAmount = defaulters.reduce((sum, d) => sum + d.pendingAmount, 0);
  const over90Days = defaulters.filter((d) => d.daysOverdue >= 90).length;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Fee Defaulters"
        subtitle="Students with overdue fee payments"
        breadcrumbs={[
          { label: 'Fees' },
          { label: 'Defaulters' },
        ]}
      />

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Users />}
          label="Total Defaulters"
          value={totalDefaulters}
          trend="up"
          trendValue={`${over90Days} critical`}
          description="90+ days overdue"
        />
        <StatCard
          icon={<DollarSign />}
          label="Total Pending Amount"
          value={formatCurrency(totalPendingAmount)}
          trend="down"
        />
        <StatCard
          icon={<AlertTriangle />}
          label="Critical (90+ days)"
          value={over90Days}
          trend={over90Days > 0 ? 'up' : 'neutral'}
        />
      </div>

      {/* Table */}
      <DataTable<FeeDefaulter>
        columns={columns}
        data={defaulters ? [...defaulters] : []}
        isLoading={isLoading}
        totalCount={data?.pagination.total}
        pageSize={params.pageSize}
        currentPage={params.page}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={handleSortChange}
        getRowId={(row) => row.id}
        searchPlaceholder="Search defaulters..."
        emptyStateMessage="No defaulters found"
      />
    </div>
  );
}

export { DefaultersPage };
