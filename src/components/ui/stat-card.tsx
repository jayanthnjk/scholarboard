import React from 'react';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon element */
  icon?: React.ReactNode;
  /** Statistic label */
  label: string;
  /** Statistic value */
  value: string | number;
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Trend value (e.g., "+12%") */
  trendValue?: string;
  /** Optional description below the trend */
  description?: string;
  /** Loading state */
  isLoading?: boolean;
}

function StatCard({
  icon,
  label,
  value,
  trend,
  trendValue,
  description,
  isLoading = false,
  className,
  ...props
}: StatCardProps) {
  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-card p-6 shadow-sm',
          className
        )}
        aria-busy="true"
        {...props}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-3 h-8 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-16 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary [&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </div>
        )}
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold text-foreground">{value}</span>
      </div>
      {(trend || trendValue || description) && (
        <div className="mt-2 flex items-center gap-1.5">
          {trend && (
            <TrendIcon
              className={cn('h-4 w-4', trendColors[trend])}
              aria-hidden="true"
            />
          )}
          {trendValue && (
            <span
              className={cn('text-sm font-medium', trend && trendColors[trend])}
            >
              {trendValue}
            </span>
          )}
          {description && (
            <span className="text-sm text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { StatCard };
export type { StatCardProps };
