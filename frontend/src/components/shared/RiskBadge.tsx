import React from 'react';
import type { RiskLevel } from '@/types';
import { riskLabel } from '@/lib/utils';
import Badge, { type BadgeVariant, type BadgeSize } from '@/components/ui/Badge';

export interface RiskBadgeProps {
  level: RiskLevel | string;
  size?: BadgeSize;
  className?: string;
  showIcon?: boolean;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'sm',
  className,
  showIcon = false,
}) => {
  const normalizedLevel = (level?.toLowerCase() || 'low') as RiskLevel;
  const variant: BadgeVariant = `risk-${normalizedLevel}` as BadgeVariant;
  const label = riskLabel(normalizedLevel);

  const getIndicatorDot = () => {
    const dotColors: Record<string, string> = {
      critical: 'bg-[#FF5A5A]',
      high: 'bg-[#FFB547]',
      medium: 'bg-[#FFE066]',
      low: 'bg-[#A3FF6F]',
    };

    return (
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColors[normalizedLevel] || 'bg-text-secondary'}`}
      />
    );
  };

  return (
    <Badge
      variant={variant}
      size={size}
      className={className}
      icon={showIcon ? getIndicatorDot() : undefined}
    >
      {label}
    </Badge>
  );
};

export default RiskBadge;
