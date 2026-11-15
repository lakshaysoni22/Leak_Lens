import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'risk-critical'
  | 'risk-high'
  | 'risk-medium'
  | 'risk-low'
  | 'info'
  | 'success'
  | 'warning';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-text-primary border border-white/10',
  'risk-critical': 'badge-critical',
  'risk-high': 'badge-high',
  'risk-medium': 'badge-medium',
  'risk-low': 'badge-low',
  info: 'bg-[#45D6FF]/15 border border-[#45D6FF]/30 text-accent-cyan',
  success: 'bg-[#A3FF6F]/15 border border-[#A3FF6F]/30 text-accent-green',
  warning: 'bg-[#FFB547]/15 border border-[#FFB547]/30 text-[#FFB547]',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px] font-medium gap-1',
  md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  icon,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full leading-none whitespace-nowrap transition-colors select-none',
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
