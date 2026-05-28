/**
 * Student list filter bar with responsive design.
 * Shows filter dropdowns on desktop, collapses to button on mobile.
 */

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { StudentFilters as FilterValues } from '../types';

interface StudentFiltersProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  className?: string;
}

const CLASS_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'transferred', label: 'Transferred' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'dropped', label: 'Dropped' },
] as const;

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: String(year), label: String(year) };
});

function StudentFilters({ filters, onChange, className }: StudentFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount = Object.values(filters).filter(Boolean).length;

  const handleChange = (key: keyof FilterValues, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const filterControls = (
    <>
      <select
        value={filters.className ?? ''}
        onChange={(e) => handleChange('className', e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filter by class"
      >
        <option value="">All Classes</option>
        {CLASS_OPTIONS.map((c) => (
          <option key={c} value={c}>Class {c}</option>
        ))}
      </select>

      <select
        value={filters.section ?? ''}
        onChange={(e) => handleChange('section', e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filter by section"
      >
        <option value="">All Sections</option>
        {SECTION_OPTIONS.map((s) => (
          <option key={s} value={s}>Section {s}</option>
        ))}
      </select>

      <select
        value={filters.status ?? ''}
        onChange={(e) => handleChange('status', e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filter by status"
      >
        <option value="">All Statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <select
        value={filters.admissionYear ?? ''}
        onChange={(e) => handleChange('admissionYear', e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filter by admission year"
      >
        <option value="">All Years</option>
        {YEAR_OPTIONS.map((y) => (
          <option key={y.value} value={y.value}>{y.label}</option>
        ))}
      </select>
    </>
  );

  return (
    <>
      {/* Desktop filters - inline */}
      <div className={cn('hidden md:contents', className)}>
        {filterControls}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="rounded-md px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Mobile filter toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
        {mobileOpen && (
          <div className="mt-2 flex flex-wrap gap-2">
            {filterControls}
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => onChange({})}
                className="rounded-md px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export { StudentFilters };
