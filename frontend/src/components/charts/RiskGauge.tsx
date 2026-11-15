import React, { useEffect, useState } from 'react';
import { useMotionValue, animate } from 'framer-motion';
import { cn, riskLabel } from '@/lib/utils';
import type { RiskLevel } from '@/types';

interface RiskGaugeProps {
  score: number;
  size?: number;
  label?: string;
  className?: string;
  showTicks?: boolean;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 200,
  label = 'Risk Score',
  className,
  showTicks = true,
}) => {
  const normalizedScore = Math.max(0, Math.min(100, score));

  // Gauge geometry
  const radius = 72;
  const center = 100;
  const circumference = 2 * Math.PI * radius; // ~452.39
  const totalArcLength = circumference * 0.75; // 270 degrees = ~339.29

  const motionScore = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(motionScore, normalizedScore, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [normalizedScore, motionScore]);

  // Active stroke length
  const activeLength = (displayValue / 100) * totalArcLength;

  // Determine color according to threshold
  const getGaugeColor = (val: number): string => {
    if (val < 25) return '#A3FF6F'; // low: green
    if (val < 50) return '#FFE066'; // medium: yellow
    if (val < 75) return '#FFB547'; // high: orange
    return '#FF5A5A';               // critical: red
  };

  const currentColor = getGaugeColor(displayValue);

  // Determine risk level category
  const getRiskCategory = (val: number): RiskLevel => {
    if (val < 25) return 'low';
    if (val < 50) return 'medium';
    if (val < 75) return 'high';
    return 'critical';
  };

  const currentLevel = getRiskCategory(displayValue);

  // Generate tick marks along the 270deg arc (-135 to +135 deg)
  const ticks = Array.from({ length: 19 }, (_, i) => {
    const angleDeg = -135 + (270 / 18) * i;
    const angleRad = (angleDeg * Math.PI) / 180;
    const rInner = i % 3 === 0 ? 82 : 85;
    const rOuter = 89;
    return {
      x1: center + rInner * Math.cos(angleRad),
      y1: center + rInner * Math.sin(angleRad),
      x2: center + rOuter * Math.cos(angleRad),
      y2: center + rOuter * Math.sin(angleRad),
      isMajor: i % 3 === 0,
    };
  });

  return (
    <div
      className={cn('relative flex flex-col items-center justify-center select-none', className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={currentColor} floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer tick marks */}
        {showTicks && (
          <g opacity="0.4">
            {ticks.map((tick, i) => (
              <line
                key={i}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke="#929BAD"
                strokeWidth={tick.isMajor ? 1.5 : 0.8}
                strokeLinecap="round"
              />
            ))}
          </g>
        )}

        {/* Background Track Arc (270 deg) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${totalArcLength} ${circumference}`}
          style={{
            transform: 'rotate(135deg)',
            transformOrigin: `${center}px ${center}px`,
          }}
        />

        {/* Active Animated Gauge Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={currentColor}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${activeLength} ${circumference}`}
          filter="url(#gaugeGlow)"
          style={{
            transform: 'rotate(135deg)',
            transformOrigin: `${center}px ${center}px`,
            transition: 'stroke 0.3s ease',
          }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
        <span
          className="text-4xl font-extrabold tracking-tight"
          style={{ color: currentColor, textShadow: `0 0 24px ${currentColor}40` }}
        >
          {displayValue.toFixed(1)}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary mt-0.5">
          {riskLabel(currentLevel)}
        </span>
        {label && (
          <span className="text-[11px] text-text-muted mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default RiskGauge;
