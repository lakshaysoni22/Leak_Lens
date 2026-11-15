import React, { useEffect, useRef } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}) => {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const count = useMotionValue(0);

  const formatted = useTransform(count, (latest) => {
    const formattedNumber = latest.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formattedNumber}${suffix}`;
  });

  useEffect(() => {
    const controls = animate(count, end, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });

    const unsubscribe = formatted.on('change', (v) => {
      if (spanRef.current) {
        spanRef.current.textContent = v;
      }
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, end, duration, formatted]);

  return (
    <span
      ref={spanRef}
      className={cn('inline-block tabular-nums font-bold', className)}
    >
      {prefix}0{suffix}
    </span>
  );
};

export default AnimatedCounter;
