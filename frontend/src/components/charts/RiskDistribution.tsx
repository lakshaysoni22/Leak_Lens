import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import type { RiskDistribution as RiskDistributionType } from '@/types';
import { cn } from '@/lib/utils';

interface RiskDistributionProps {
  data: RiskDistributionType;
  height?: number;
  className?: string;
  showLegend?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: { color?: string };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="glass px-3 py-2 border border-white/10 shadow-xl text-xs">
        <p className="font-semibold text-text-primary flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: item.payload?.color }}
          />
          <span>{item.name}:</span>
          <span className="font-bold text-text-primary">{item.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const RiskDistribution: React.FC<RiskDistributionProps> = ({
  data,
  height = 240,
  className,
  showLegend = true,
}) => {
  const chartData = [
    { name: 'Critical', value: data?.critical ?? 0, color: '#FF5A5A', badgeClass: 'badge-critical' },
    { name: 'High', value: data?.high ?? 0, color: '#FFB547', badgeClass: 'badge-high' },
    { name: 'Medium', value: data?.medium ?? 0, color: '#FFE066', badgeClass: 'badge-medium' },
    { name: 'Low', value: data?.low ?? 0, color: '#A3FF6F', badgeClass: 'badge-low' },
  ];

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center text-text-secondary text-sm border border-white/5 rounded-xl bg-surface/30 p-6',
          className
        )}
        style={{ height }}
      >
        <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-2">
          <span className="text-xs text-text-muted">0%</span>
        </div>
        <p className="text-text-muted text-xs">No risk events recorded</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col sm:flex-row items-center gap-4 w-full', className)}>
      <div className="relative flex-1 w-full" style={{ height, minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              isAnimationActive={true}
              animationDuration={1200}
              stroke="rgba(8, 11, 18, 0.8)"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label showing total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-text-primary tracking-tight">
            {total}
          </span>
          <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">
            Total
          </span>
        </div>
      </div>

      {/* Custom Legend */}
      {showLegend && (
        <div className="flex flex-row sm:flex-col flex-wrap gap-2 justify-center pr-2">
          {chartData.map((item) => {
            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg bg-surface/50 border border-white/5 min-w-[120px]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 8px ${item.color}60`,
                    }}
                  />
                  <span className="text-xs text-text-secondary font-medium">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="text-text-primary">{item.value}</span>
                  <span className="text-text-muted text-[10px]">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiskDistribution;
