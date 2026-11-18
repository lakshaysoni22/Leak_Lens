import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScannerAnimationProps {
  size?: number;
  isScanning?: boolean;
  className?: string;
}

interface Blip {
  id: number;
  x: number;
  y: number;
  delay: number;
}

const ScannerAnimation: React.FC<ScannerAnimationProps> = ({
  size = 280,
  isScanning = true,
  className,
}) => {
  const [blips, setBlips] = useState<Blip[]>([
    { id: 1, x: 65, y: 35, delay: 0 },
    { id: 2, x: 38, y: 70, delay: 0.8 },
    { id: 3, x: 75, y: 62, delay: 1.4 },
    { id: 4, x: 30, y: 32, delay: 2.1 },
  ]);

  useEffect(() => {
    if (!isScanning) return;

    // Periodically shuffle or refresh blip positions
    const interval = setInterval(() => {
      setBlips((prev) =>
        prev.map((b) => ({
          ...b,
          // Constrain within the radar disk (radius ~ 42 from center 50,50)
          x: 50 + (Math.random() * 70 - 35),
          y: 50 + (Math.random() * 70 - 35),
        }))
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isScanning]);

  const rings = [12, 24, 36, 46];

  return (
    <div
      className={cn('relative flex items-center justify-center select-none', className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Radial radar sweep gradient */}
          <linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A3FF6F" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#A3FF6F" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#A3FF6F" stopOpacity="0" />
          </linearGradient>

          {/* Glowing dot filter */}
          <filter id="radarGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer subtle glow disk */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="rgba(163, 255, 111, 0.02)"
          stroke="rgba(163, 255, 111, 0.25)"
          strokeWidth="0.8"
        />

        {/* 4 Concentric Radar Rings */}
        {rings.map((r, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="rgba(163, 255, 111, 0.16)"
            strokeWidth="0.6"
            strokeDasharray={i === 3 ? '1.5 2' : undefined}
          />
        ))}

        {/* Crosshairs */}
        <line
          x1="4"
          y1="50"
          x2="96"
          y2="50"
          stroke="rgba(163, 255, 111, 0.12)"
          strokeWidth="0.6"
        />
        <line
          x1="50"
          y1="4"
          x2="50"
          y2="96"
          stroke="rgba(163, 255, 111, 0.12)"
          strokeWidth="0.6"
        />

        {/* 45 degree diagonal ticks */}
        <line
          x1="18"
          y1="18"
          x2="82"
          y2="82"
          stroke="rgba(163, 255, 111, 0.06)"
          strokeWidth="0.5"
          strokeDasharray="2 3"
        />
        <line
          x1="82"
          y1="18"
          x2="18"
          y2="82"
          stroke="rgba(163, 255, 111, 0.06)"
          strokeWidth="0.5"
          strokeDasharray="2 3"
        />

        {/* Rotating sweep cone & line */}
        {isScanning && (
          <g className="radar-sweep" style={{ transformOrigin: '50px 50px' }}>
            {/* 45-degree pie sector with gradient */}
            <path
              d="M 50 50 L 50 4 A 46 46 0 0 1 82.5 17.5 Z"
              fill="url(#radarSweepGrad)"
            />
            {/* Bright leading sweep line */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="4"
              stroke="#A3FF6F"
              strokeWidth="1.2"
              filter="url(#radarGlow)"
            />
          </g>
        )}

        {/* Pulse ring on scanning center */}
        {isScanning && (
          <circle
            cx="50"
            cy="50"
            r="8"
            fill="none"
            stroke="#A3FF6F"
            strokeWidth="0.8"
            className="pulse-ring"
            style={{ transformOrigin: '50px 50px' }}
          />
        )}

        {/* Center pivot dot */}
        <circle cx="50" cy="50" r="2.2" fill="#A3FF6F" filter="url(#radarGlow)" />
        <circle cx="50" cy="50" r="1" fill="#080B12" />

        {/* Blips appearing and fading */}
        {isScanning && (
          <AnimatePresence>
            {blips.map((blip) => (
              <g key={blip.id}>
                <motion.circle
                  cx={blip.x}
                  cy={blip.y}
                  r="2"
                  fill="#A3FF6F"
                  filter="url(#radarGlow)"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 1, 0.8, 0],
                    scale: [0.5, 1.2, 1, 0.8],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    delay: blip.delay,
                    ease: 'easeInOut',
                  }}
                />
                <motion.circle
                  cx={blip.x}
                  cy={blip.y}
                  r="5"
                  fill="none"
                  stroke="#A3FF6F"
                  strokeWidth="0.5"
                  initial={{ opacity: 0.8, scale: 0.6 }}
                  animate={{
                    opacity: [0.8, 0],
                    scale: [0.6, 2],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    delay: blip.delay,
                    ease: 'easeOut',
                  }}
                />
              </g>
            ))}
          </AnimatePresence>
        )}
      </svg>
    </div>
  );
};

export default ScannerAnimation;
