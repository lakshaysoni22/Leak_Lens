import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'line' | 'pills';
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'line',
}) => {
  return (
    <div
      className={cn(
        'relative flex items-center gap-1 border-b border-white/[0.08]',
        variant === 'pills' && 'p-1 rounded-xl bg-surface/70 border border-white/5',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={cn(
              'relative flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none select-none',
              isActive
                ? 'text-accent-green font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]',
              tab.disabled && 'opacity-40 cursor-not-allowed',
              variant === 'pills' && 'rounded-lg py-2'
            )}
          >
            {tab.icon && (
              <span className={cn('w-4 h-4 transition-colors', isActive ? 'text-accent-green' : 'text-text-muted')}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>

            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-tight',
                  isActive
                    ? 'bg-accent-green/20 text-accent-green'
                    : 'bg-white/10 text-text-muted'
                )}
              >
                {tab.badge}
              </span>
            )}

            {/* Sliding Active Indicator */}
            {isActive && variant === 'line' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-green shadow-[0_0_12px_#A3FF6F]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}

            {isActive && variant === 'pills' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
