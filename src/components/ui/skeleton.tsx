import { cn } from '@/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width of the skeleton element */
  width?: string | number;
  /** Height of the skeleton element */
  height?: string | number;
  /** Shape variant */
  variant?: 'rectangular' | 'circular' | 'text';
  /** Number of text lines to render */
  lines?: number;
}

function Skeleton({
  className,
  width,
  height,
  variant = 'rectangular',
  lines = 1,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses =
    'animate-pulse bg-muted relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent';

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, 'h-4 rounded')}
            style={{
              width: i === lines - 1 ? '75%' : '100%',
              ...style,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variant === 'circular' ? 'rounded-full' : 'rounded-md',
        variant === 'text' && 'h-4',
        className
      )}
      style={{
        width: width ?? undefined,
        height: height ?? undefined,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
export type { SkeletonProps };
