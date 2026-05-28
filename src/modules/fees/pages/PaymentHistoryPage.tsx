/**
 * Payment History page - DataTable with payment records, filters, and receipt view.
 */

import { useState, useCallback } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/ui/data-table';
import { usePaymentHistory } from '../api';
import { ReceiptView } from '../components/ReceiptView';
import type { PaymentRecord, FeeListParams, FeePaymentFilters } from '../types';
import { Eye, FileText } from 'lucide-react';

function PaymentHistoryPage() {
  const [params, setParams] = useState<FeeListParams>({
    page: 1,
    pageSize: 20,
    filters: {},
  });
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [filters, setFilters] = useState<FeePaymentFilters>({});

  const { data, isLoading } = usePaymentHistory(params);

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

  const handleFilterChange = (key: keyof FeePaymentFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    setParams((prev) => ({ ...prev, filters: newFilters, page: 1 }));
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
      partial: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300',
    };
    return (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns: ColumnDef<PaymentRecord, unknown>[] = [
    {
      accessorKey: 'receiptNumber',
      header: 'Receipt #',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.receiptNumber}</span>
      ),
    },
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.studentName}</p>
          <p className="text-xs text-muted-foreground">Class {row.original.className}</p>
        </div>
      ),
    },
    {
      accessorKey: 'paidAmount',
      header: 'Amount',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{formatCurrency(row.original.paidAmount)}</p>
          {row.original.dueAmount > 0 && (
            <p className="text-xs text-muted-foreground">
              Due: {formatCurrency(row.original.dueAmount)}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => (
        <span className="text-sm capitalize">{row.original.method.replace('_', ' ')}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'paidDate',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.paidDate).toLocaleDateString('en-IN')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => setSelectedPayment(row.original)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
          aria-label={`View receipt for ${row.original.receiptNumber}`}
        >
          <Eye className="h-3.5 w-3.5" />
          Receipt
        </button>
      ),
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Payment History"
        subtitle="View all fee payment records"
        breadcrumbs={[
          { label: 'Fees' },
          { label: 'Payments' },
        ]}
        actions={
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {data?.pagination.total ?? 0} records
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
          <select
            value={filters.status ?? ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Method</label>
          <select
            value={filters.method ?? ''}
            onChange={(e) => handleFilterChange('method', e.target.value)}
            className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="upi">UPI</option>
            <option value="net_banking">Net Banking</option>
            <option value="card">Card</option>
            <option value="dd">DD</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Class</label>
          <input
            type="text"
            placeholder="e.g. 10"
            value={filters.className ?? ''}
            onChange={(e) => handleFilterChange('className', e.target.value)}
            className="h-8 w-20 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
          <input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
          <input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable<PaymentRecord>
        columns={columns}
        data={data?.data ? [...data.data] : []}
        isLoading={isLoading}
        totalCount={data?.pagination.total}
        pageSize={params.pageSize}
        currentPage={params.page}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={handleSortChange}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by student name or receipt..."
        emptyStateMessage="No payment records found"
      />

      {/* Receipt Modal */}
      {selectedPayment && (
        <ReceiptView
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}

export { PaymentHistoryPage };
