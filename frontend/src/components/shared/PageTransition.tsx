import React from 'react';
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface PageTransitionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

// EXTREME SMOOTH — GPU-accelerated, minimal paint, 60fps
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,                  // Smaller offset = snappier feel
    willChange: 'transform, opacity',
  },
  animate: {
    opacity: 1,
    y: 0,
    willChange: 'auto',    // Release GPU layer after animation
    transition: {
      duration: 0.25,      // Faster entrance (was 0.35)
      ease: [0.25, 0.46, 0.45, 0.94],  // Custom easeOut curve
    },
  },
  exit: {
    opacity: 0,
    y: -4,                 // Minimal exit offset
    transition: {
      duration: 0.15,      // Even faster exit (was 0.2)
      ease: 'easeIn',
    },
  },
};

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('w-full flex-1', className)}
      style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
