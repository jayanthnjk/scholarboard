import React from 'react';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';

interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether content is loading */
  isLoading?: boolean;
  /** Max width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Custom loading skeleton */
  loadingSkeleton?: React.ReactNode;
}

function PageContent({
  children,
  isLoading = false,
  maxWidth = 'full',
  loadingSkeleton,
  className,
  ...props
}: PageContentProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'w-full px-4 py-6 sm:px-6 lg:px-8',
          maxWidthClasses[maxWidth],
          className
        )}
        aria-busy="true"
        {...props}
      >
        {loadingSkeleton ?? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full px-4 py-6 sm:px-6 lg:px-8',
        maxWidthClasses[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { PageContent };
export type { PageContentProps };
