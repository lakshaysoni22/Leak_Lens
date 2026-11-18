import React from 'react';
import { cn } from '@/lib/utils';

export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'card';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className,
  style,
  ...props
}) => {
  if (variant === 'card') {
    return (
      <div
        className={cn(
          'stat-card p-6 flex flex-col justify-between gap-4 border border-white/5 bg-surface/40',
          className
        )}
        style={{ width, height, ...style }}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-8 w-8 rounded-lg" />
        </div>
        <div className="space-y-2 my-1">
          <div className="skeleton h-8 w-20 rounded-md" />
          <div className="skeleton h-3 w-36 rounded" />
        </div>
        <div className="skeleton h-3 w-24 rounded" />
      </div>
    );
  }

  const variantClassMap: Record<Exclude<SkeletonVariant, 'card'>, string> = {
    text: 'h-4 w-full rounded',
    circle: 'rounded-full flex-shrink-0',
    rect: 'rounded-lg',
  };

  const computedStyle: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
    ...style,
  };

  return (
    <div
      className={cn('skeleton', variantClassMap[variant], className)}
      style={computedStyle}
      aria-hidden="true"
      {...props}
    />
  );
};

export default Skeleton;
