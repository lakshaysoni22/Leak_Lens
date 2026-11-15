import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { cn, formatDate } from '@/lib/utils';

export interface ActivityPoint {
  date: string;
  count: number;
}

interface ActivityChartProps {
  data: ActivityPoint[];
  height?: number;
  className?: string;
  showGrid?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0]?.value;
    return (
      <div className="glass px-3 py-2 border border-white/10 shadow-xl text-xs">
        <p className="text-text-secondary mb-1">
          {label ? (label.length > 7 ? formatDate(label) : label) : ''}
        </p>
        <p className="font-semibold text-accent-green flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-green inline-block shadow-[0_0_8px_#A3FF6F]" />
          <span>{value} activities</span>
        </p>
      </div>
    );
  }
  return null;
};

const ActivityChart: React.FC<ActivityChartProps> = ({
  data,
  height = 240,
  className,
  showGrid = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center text-text-secondary text-sm border border-white/5 rounded-xl bg-surface/30',
          className
        )}
        style={{ height }}
      >
        <p>No activity data available</p>
      </div>
    );
  }

  const formatTickDate = (tickStr: string) => {
    try {
      const d = new Date(tickStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return tickStr;
    }
  };

  return (
    <div className={cn('w-full', className)} style={{ height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="activityBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A3FF6F" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#45D6FF" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="activityBarHoverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A3FF6F" stopOpacity={1} />
              <stop offset="100%" stopColor="#45D6FF" stopOpacity={0.8} />
            </linearGradient>
            <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#A3FF6F" floodOpacity="0.35" />
            </filter>
          </defs>

          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.05)"
              vertical={false}
            />
          )}

          <XAxis
            dataKey="date"
            tickFormatter={formatTickDate}
            stroke="#4B5563"
            tick={{ fill: '#929BAD', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
          />
          <YAxis
            stroke="#4B5563"
            tick={{ fill: '#929BAD', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />

          <Bar
            dataKey="count"
            fill="url(#activityBarGrad)"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
