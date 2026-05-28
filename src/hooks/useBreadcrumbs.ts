/**
 * Hook for generating breadcrumbs from the current route path.
 * Resolves labels from ConfigProvider navigation config.
 * @see Task 8.5 - Breadcrumb Generator Hook
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useConfig } from '@/providers/ConfigProvider';
import type { NavigationItem } from '@/types/config';

interface BreadcrumbItem {
  readonly label: string;
  readonly path: string;
  readonly isCurrentPage: boolean;
}

const MAX_SEGMENTS = 6;

/**
 * Recursively search navigation items for a matching path and return its label.
 */
function findLabelInNavigation(
  items: readonly NavigationItem[],
  path: string,
): string | null {
  for (const item of items) {
    if (item.path === path) {
      return item.label;
    }
    if (item.children) {
      const childLabel = findLabelInNavigation(item.children, path);
      if (childLabel) return childLabel;
    }
  }
  return null;
}

/**
 * Capitalize and format a path segment into a human-readable label.
 */
function formatSegmentLabel(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * useBreadcrumbs generates breadcrumbs from the current route path.
 * - Max 6 segments; deeper paths are truncated with an ellipsis entry.
 * - Resolves labels from navigation config when available.
 *
 * @example
 * ```tsx
 * const breadcrumbs = useBreadcrumbs();
 *
 * return (
 *   <nav aria-label="Breadcrumb">
 *     <ol>
 *       {breadcrumbs.map((crumb) => (
 *         <li key={crumb.path}>
 *           {crumb.isCurrentPage ? (
 *             <span aria-current="page">{crumb.label}</span>
 *           ) : (
 *             <a href={crumb.path}>{crumb.label}</a>
 *           )}
 *         </li>
 *       ))}
 *     </ol>
 *   </nav>
 * );
 * ```
 */
export function useBreadcrumbs(): readonly BreadcrumbItem[] {
  const location = useLocation();
  const { navigation } = useConfig();

  return useMemo(() => {
    const pathSegments = location.pathname
      .split('/')
      .filter((segment) => segment.length > 0);

    if (pathSegments.length === 0) {
      return [{ label: 'Home', path: '/', isCurrentPage: true }];
    }

    // Build breadcrumb entries
    let entries: BreadcrumbItem[] = [
      { label: 'Home', path: '/', isCurrentPage: false },
    ];

    pathSegments.forEach((segment, index) => {
      const fullPath = '/' + pathSegments.slice(0, index + 1).join('/');
      const isLast = index === pathSegments.length - 1;

      // Try to resolve label from navigation config
      const resolvedLabel = findLabelInNavigation(navigation.items, fullPath);
      const label = resolvedLabel ?? formatSegmentLabel(segment);

      entries.push({
        label,
        path: fullPath,
        isCurrentPage: isLast,
      });
    });

    // Truncate if exceeding max segments
    if (entries.length > MAX_SEGMENTS) {
      const head = entries.slice(0, 2); // Home + first segment
      const tail = entries.slice(-(MAX_SEGMENTS - 3)); // Last few items
      const ellipsis: BreadcrumbItem = {
        label: '…',
        path: '',
        isCurrentPage: false,
      };
      entries = [...head, ellipsis, ...tail];
    }

    return entries;
  }, [location.pathname, navigation.items]);
}
