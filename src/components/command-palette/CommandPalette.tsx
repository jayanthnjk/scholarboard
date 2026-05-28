/**
 * Global Command Palette / Search component.
 * Activated by Ctrl+K / Cmd+K with debounced search, categorized results,
 * and full keyboard navigation.
 * @see Requirements 11.1
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users,
  CreditCard,
  FileText,
  Zap,
  Clock,
  ArrowRight,
} from 'lucide-react';

// --- Types ---

type ResultCategory = 'Students' | 'Fees' | 'Pages' | 'Actions';

interface SearchResult {
  readonly id: string;
  readonly label: string;
  readonly category: ResultCategory;
  readonly description?: string;
  readonly path?: string;
  readonly action?: () => void;
  readonly icon?: React.ReactNode;
}

// --- Static Data ---

const CATEGORY_ICONS: Record<ResultCategory, React.ReactNode> = {
  Students: <Users className="h-4 w-4" />,
  Fees: <CreditCard className="h-4 w-4" />,
  Pages: <FileText className="h-4 w-4" />,
  Actions: <Zap className="h-4 w-4" />,
};

const ALL_RESULTS: readonly SearchResult[] = [
  { id: 'students-list', label: 'All Students', category: 'Students', path: '/students', description: 'View student list' },
  { id: 'students-admission', label: 'New Admission', category: 'Students', path: '/students/admission', description: 'Create new student admission' },
  { id: 'fees-structure', label: 'Fee Structure', category: 'Fees', path: '/fees/structure', description: 'Manage fee structures' },
  { id: 'fees-payments', label: 'Payments', category: 'Fees', path: '/fees/payments', description: 'View payment history' },
  { id: 'fees-defaulters', label: 'Fee Defaulters', category: 'Fees', path: '/fees/defaulters', description: 'View defaulters list' },
  { id: 'page-dashboard', label: 'Dashboard', category: 'Pages', path: '/dashboard', description: 'Go to dashboard' },
  { id: 'page-attendance', label: 'Attendance', category: 'Pages', path: '/attendance', description: 'Attendance management' },
  { id: 'page-exams', label: 'Examinations', category: 'Pages', path: '/exams', description: 'Exam management' },
  { id: 'page-timetable', label: 'Timetable', category: 'Pages', path: '/timetable', description: 'View timetable' },
  { id: 'page-reports', label: 'Reports', category: 'Pages', path: '/reports', description: 'View reports' },
  { id: 'page-settings', label: 'Settings', category: 'Pages', path: '/settings', description: 'Application settings' },
  { id: 'action-export', label: 'Export Data', category: 'Actions', description: 'Export current view as CSV' },
  { id: 'action-refresh', label: 'Refresh Data', category: 'Actions', description: 'Reload current page data' },
];

const RECENT_SEARCHES_KEY = 'erp-recent-searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string): void {
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

// --- Component ---

export function CommandPalette(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Filter results
  const results = useMemo<SearchResult[]>(() => {
    if (!debouncedQuery.trim()) return [];
    const lower = debouncedQuery.toLowerCase();
    return ALL_RESULTS.filter(
      (r) =>
        r.label.toLowerCase().includes(lower) ||
        r.description?.toLowerCase().includes(lower) ||
        r.category.toLowerCase().includes(lower),
    );
  }, [debouncedQuery]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups = new Map<ResultCategory, SearchResult[]>();
    for (const result of results) {
      const existing = groups.get(result.category) ?? [];
      existing.push(result);
      groups.set(result.category, existing);
    }
    return groups;
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    const flat: SearchResult[] = [];
    for (const items of groupedResults.values()) {
      flat.push(...items);
    }
    return flat;
  }, [groupedResults]);

  const recentSearches = useMemo(() => getRecentSearches(), [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (query.trim()) {
        saveRecentSearch(query.trim());
      }
      setIsOpen(false);
      if (result.path) {
        navigate(result.path);
      } else if (result.action) {
        result.action();
      }
    },
    [navigate, query],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatResults[activeIndex]) {
            handleSelect(flatResults[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [flatResults, activeIndex, handleSelect],
  );

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-label="Command palette"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search students, fees, pages, actions…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search"
                role="combobox"
                aria-expanded={flatResults.length > 0}
                aria-activedescendant={
                  flatResults[activeIndex]
                    ? `cmd-result-${flatResults[activeIndex].id}`
                    : undefined
                }
              />
              <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground sm:inline-block">
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="max-h-80 overflow-y-auto p-2"
              role="listbox"
            >
              {/* Empty state with recent searches */}
              {!debouncedQuery.trim() && (
                <div className="space-y-3 p-2">
                  {recentSearches.length > 0 && (
                    <>
                      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Recent Searches
                      </p>
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setQuery(term)}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                        >
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </>
                  )}
                  {recentSearches.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Start typing to search…
                    </p>
                  )}
                </div>
              )}

              {/* No results */}
              {debouncedQuery.trim() && flatResults.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No results for &quot;{debouncedQuery}&quot;
                </p>
              )}

              {/* Categorized Results */}
              {Array.from(groupedResults.entries()).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <p className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {CATEGORY_ICONS[category]}
                    {category}
                  </p>
                  {items.map((result) => {
                    const globalIndex = flatResults.indexOf(result);
                    const isActive = globalIndex === activeIndex;
                    return (
                      <button
                        key={result.id}
                        id={`cmd-result-${result.id}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        data-active={isActive}
                        onClick={() => handleSelect(result)}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                        }`}
                      >
                        <span className="flex-1">
                          <span className="font-medium">{result.label}</span>
                          {result.description && (
                            <span className="ml-2 text-muted-foreground">
                              {result.description}
                            </span>
                          )}
                        </span>
                        {isActive && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
              <span>
                <kbd className="rounded border bg-muted px-1 py-0.5">↑↓</kbd> Navigate{' '}
                <kbd className="rounded border bg-muted px-1 py-0.5">↵</kbd> Select
              </span>
              <span>
                <kbd className="rounded border bg-muted px-1 py-0.5">⌘K</kbd> Toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
