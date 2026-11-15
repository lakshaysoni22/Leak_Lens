import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  actionIcon?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const renderIcon = () => {
    if (!Icon) return null;

    if (React.isValidElement(Icon)) {
      return Icon;
    }

    if (typeof Icon === 'function' || typeof Icon === 'object') {
      const IconComponent = Icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-8 h-8 text-text-muted" />;
    }

    return null;
  };

  return (
    <div
      className={cn(
        'glass flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-white/5',
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5 shadow-inner">
          {renderIcon()}
        </div>
      )}

      <h3 className="text-lg font-bold text-text-primary tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-sm text-text-secondary max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center flex-wrap gap-3 justify-center">
          {actionLabel && onAction && (
            <Button
              variant="primary"
              size="md"
              onClick={onAction}
              leftIcon={actionIcon}
            >
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="secondary"
              size="md"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
