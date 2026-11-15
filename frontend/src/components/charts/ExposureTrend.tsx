import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { TrendPoint } from '@/types';
import { cn, formatDate } from '@/lib/utils';

interface ExposureTrendProps {
  data: TrendPoint[];
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
          <span>{value} scans</span>
        </p>
      </div>
    );
  }
  return null;
};

const ExposureTrend: React.FC<ExposureTrendProps> = ({
  data,
  height = 260,
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
        <p>No trend data available</p>
      </div>
    );
  }

  // Format short date for X-Axis tick
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
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A3FF6F" stopOpacity={0.35} />
              <stop offset="50%" stopColor="#45D6FF" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#A3FF6F" stopOpacity={0} />
            </linearGradient>
            <filter id="areaLineGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#A3FF6F" floodOpacity="0.4" />
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

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="scans"
            stroke="#A3FF6F"
            strokeWidth={2}
            fill="url(#trendAreaGradient)"
            filter="url(#areaLineGlow)"
            dot={false}
            activeDot={{
              r: 5,
              fill: '#A3FF6F',
              stroke: '#080B12',
              strokeWidth: 2,
              filter: 'url(#areaLineGlow)',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExposureTrend;
