import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type GlowColor = 'green' | 'cyan' | 'purple';

interface GlowEffectProps {
  color?: GlowColor;
  size?: number;
  className?: string;
  intensity?: number;
}

const colorMap: Record<GlowColor, { gradient: string; dot: string }> = {
  green: {
    gradient: 'radial-gradient(circle, rgba(163,255,111,0.18) 0%, rgba(163,255,111,0.06) 40%, rgba(163,255,111,0) 70%)',
    dot: 'rgba(163,255,111,0.3)',
  },
  cyan: {
    gradient: 'radial-gradient(circle, rgba(69,214,255,0.18) 0%, rgba(69,214,255,0.06) 40%, rgba(69,214,255,0) 70%)',
    dot: 'rgba(69,214,255,0.3)',
  },
  purple: {
    gradient: 'radial-gradient(circle, rgba(139,124,255,0.18) 0%, rgba(139,124,255,0.06) 40%, rgba(139,124,255,0) 70%)',
    dot: 'rgba(139,124,255,0.3)',
  },
};

const GlowEffect: React.FC<GlowEffectProps> = ({
  color = 'green',
  size = 320,
  className,
  intensity = 1,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: -9999, y: -9999 });

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    // Ensure parent position context
    const currentPositionStyle = window.getComputedStyle(parent).position;
    if (currentPositionStyle === 'static') {
      parent.style.position = 'relative';
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPosition({ x, y });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);
    parent.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      parent.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  const activeColor = colorMap[color] || colorMap.green;

  return (
    <div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{ opacity: isVisible ? intensity : 0 }}
      aria-hidden="true"
    >
      <div
        className="absolute rounded-full will-change-transform"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: activeColor.gradient,
          transform: `translate3d(${position.x - size / 2}px, ${position.y - size / 2}px, 0)`,
          transition: 'transform 0.08s ease-out',
        }}
      />
    </div>
  );
};

export default GlowEffect;
