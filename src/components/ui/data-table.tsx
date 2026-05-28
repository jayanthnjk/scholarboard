import React, { useMemo, useCallback, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/utils/cn';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Search,
  X,
} from 'lucide-react';
import { Skeleton } from './skeleton';
import { EmptyState } from './empty-state';

// ---------- Types ----------

interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
  onClick: (selectedIds: string[]) => void;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  totalCount?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSortChange?: (sort: { field: string; direction: 'asc' | 'desc' } | null) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  onRowSelect?: (selectedIds: string[]) => void;
  bulkActions?: BulkAction[];
  searchPlaceholder?: string;
  emptyStateMessage?: string;
  enableVirtualization?: boolean;
  rowHeight?: number;
  /** Function to extract a unique ID from a row */
  getRowId?: (row: TData) => string;
}

// ---------- Sub-components ----------

function DataTableColumnToggle<TData>({
  table,
}: {
  table: ReturnType<typeof useReactTable<TData>>;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
        aria-expanded={open}
        aria-label="Toggle column visibility"
      >
        <Columns3 className="h-4 w-4" />
        Columns
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-popover p-2 shadow-md">
          {table.getAllLeafColumns().map((column) => {
            if (!column.getCanHide()) return null;
            return (
              <label
                key={column.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                  className="h-4 w-4 rounded border-input"
                />
                {typeof column.columnDef.header === 'string'
                  ? column.columnDef.header
                  : column.id}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to{' '}
        {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">
          Rows:
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="ml-1 rounded border bg-background px-2 py-1 text-sm"
            aria-label="Page size"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange?.(1)}
            disabled={currentPage <= 1}
            className="rounded p-1 hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded p-1 hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-sm">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded p-1 hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange?.(totalPages)}
            disabled={currentPage >= totalPages}
            className="rounded p-1 hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DataTableBulkActions({
  selectedCount,
  actions,
  selectedIds,
  onClearSelection,
}: {
  selectedCount: number;
  actions: BulkAction[];
  selectedIds: string[];
  onClearSelection: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted/50 px-4 py-2">
      <span className="text-sm font-medium">
        {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => action.onClick(selectedIds)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              action.variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onClearSelection}
        className="ml-auto rounded p-1 hover:bg-accent"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------- Mobile Card View ----------

function DataTableMobileCard<TData>({
  row,
  columns,
}: {
  row: TData;
  columns: ColumnDef<TData, unknown>[];
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      {columns.map((col) => {
        const header =
          typeof col.header === 'string' ? col.header : col.id ?? '';
        const accessorKey =
          'accessorKey' in col ? (col.accessorKey as string) : undefined;
        const value = accessorKey
          ? (row as Record<string, unknown>)[accessorKey]
          : '';
        return (
          <div key={col.id ?? accessorKey ?? header} className="flex justify-between py-1.5 border-b last:border-0">
            <span className="text-sm font-medium text-muted-foreground">
              {header}
            </span>
            <span className="text-sm text-foreground">{String(value ?? '')}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Main Component ----------

function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  totalCount,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onFilterChange,
  onRowSelect,
  bulkActions = [],
  searchPlaceholder = 'Search...',
  emptyStateMessage = 'No data found',
  enableVirtualization = false,
  rowHeight = 48,
  getRowId,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const effectiveTotalCount = totalCount ?? data.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotalCount / pageSize));

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    getRowId: getRowId
      ? (row) => getRowId(row)
      : undefined,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      if (onSortChange) {
        if (newSorting.length > 0) {
          const sort = newSorting[0];
          if (sort) {
            onSortChange({ field: sort.id, direction: sort.desc ? 'desc' : 'asc' });
          }
        } else {
          onSortChange(null);
        }
      }
    },
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
      if (onFilterChange) {
        const filterMap: Record<string, string> = {};
        newFilters.forEach((f) => {
          filterMap[f.id] = String(f.value);
        });
        onFilterChange(filterMap);
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      if (onRowSelect) {
        onRowSelect(Object.keys(newSelection).filter((k) => newSelection[k]));
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
  });

  const { rows } = table.getRowModel();

  // Virtual scrolling
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeight,
    enabled: enableVirtualization,
  });

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((k) => rowSelection[k]),
    [rowSelection]
  );

  const clearSelection = useCallback(() => {
    setRowSelection({});
    onRowSelect?.([]);
  }, [onRowSelect]);

  // Skeleton loading
  if (isLoading) {
    return (
      <div className="w-full rounded-lg border" aria-busy="true" aria-label="Loading data">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="divide-y">
          {Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 w-4" variant="rectangular" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Toolbar - only show when search is enabled */}
      {searchPlaceholder ? (
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-64"
              aria-label="Search table"
            />
          </div>
          <DataTableColumnToggle<TData> table={table} />
        </div>
      ) : null}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && bulkActions.length > 0 && (
        <DataTableBulkActions
          selectedCount={selectedIds.length}
          actions={bulkActions}
          selectedIds={selectedIds}
          onClearSelection={clearSelection}
        />
      )}

      {/* Desktop Table */}
      <div
        ref={tableContainerRef}
        className={cn(
          'hidden md:block rounded-xl border border-[#ECEDF3] bg-white shadow-card overflow-hidden',
          enableVirtualization && 'max-h-[520px] overflow-y-auto'
        )}
      >
        <table className="w-full text-sm" role="grid">
          <thead className="sticky top-0 z-10 bg-[#F5F6FA] border-b border-[#ECEDF3]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-[#6E7191]"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {header.column.getCanSort() ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 hover:text-[#1B1D3A] transition-colors"
                            onClick={header.column.getToggleSortingHandler()}
                            aria-label={`Sort by ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id}`}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-40" />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[#ECEDF3]">
            {enableVirtualization ? (
              <>
                {rowVirtualizer.getVirtualItems().length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <EmptyState title={emptyStateMessage} size="sm" />
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px` }}>
                      <td colSpan={columns.length} />
                    </tr>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const row = rows[virtualRow.index];
                      if (!row) return null;
                      return (
                        <tr
                          key={row.id}
                          data-state={row.getIsSelected() ? 'selected' : undefined}
                          className="transition-colors hover:bg-[#F5F6FA] data-[state=selected]:bg-[#F0F0F8]"
                          style={{ height: `${rowHeight}px` }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-3 align-middle text-[#1B1D3A]">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                    <tr
                      style={{
                        height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems().slice(-1)[0]?.end ?? 0)}px`,
                      }}
                    >
                      <td colSpan={columns.length} />
                    </tr>
                  </>
                )}
              </>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-32 text-center">
                  <EmptyState title={emptyStateMessage} size="sm" />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className="transition-colors hover:bg-[#F5F6FA] data-[state=selected]:bg-[#F0F0F8]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle text-[#1B1D3A]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <EmptyState title={emptyStateMessage} size="sm" />
        ) : (
          rows.map((row) => (
            <DataTableMobileCard
              key={row.id}
              row={row.original}
              columns={columns}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {onPageChange && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={effectiveTotalCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}

export { DataTable };
export type { DataTableProps, BulkAction };
