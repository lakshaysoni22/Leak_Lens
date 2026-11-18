import React from 'react';
import type { DataSource } from '@/types';
import Badge, { type BadgeSize } from '@/components/ui/Badge';
import { ShieldCheck, AlertTriangle, Sparkles, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataSourceBadgeProps {
  dataSource: DataSource | string;
  size?: BadgeSize;
  className?: string;
  showIcon?: boolean;
}

const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  dataSource,
  size = 'sm',
  className,
  showIcon = true,
}) => {
  switch (dataSource) {
    case 'synthetic':
      return (
        <Badge
          variant="warning"
          size={size}
          className={cn('font-semibold', className)}
          icon={showIcon ? <AlertTriangle className="w-3 h-3 text-[#FFB547]" /> : undefined}
        >
          Synthetic Data
        </Badge>
      );

    case 'live_intelligence':
      return (
        <Badge
          variant="success"
          size={size}
          className={cn('font-semibold', className)}
          icon={showIcon ? <ShieldCheck className="w-3.5 h-3.5 text-accent-green" /> : undefined}
        >
          Live Intelligence
        </Badge>
      );

    case 'osint':
      return (
        <Badge
          variant="info"
          size={size}
          className={cn('font-semibold', className)}
          icon={showIcon ? <Globe className="w-3.5 h-3.5 text-accent-blue" /> : undefined}
        >
          OSINT Intelligence
        </Badge>
      );

    case 'demo':
    default:
      return (
        <Badge
          variant="info"
          size={size}
          className={cn('font-semibold', className)}
          icon={showIcon ? <Sparkles className="w-3 h-3 text-accent-cyan" /> : undefined}
        >
          Demo Intelligence
        </Badge>
      );
  }
};

export default DataSourceBadge;
