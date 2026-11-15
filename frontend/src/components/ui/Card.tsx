import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'gradient' | 'stat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  glow?: 'none' | 'green' | 'cyan' | 'purple'
}

const variantClasses = {
  default: 'glass-card',
  hover: 'glass-card glass-card-hover',
  gradient: 'glass-card gradient-border',
  stat: 'stat-card',
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const glowClasses = {
  none: '',
  green: 'shadow-[0_0_40px_rgba(163,255,111,0.08)]',
  cyan: 'shadow-[0_0_40px_rgba(69,214,255,0.08)]',
  purple: 'shadow-[0_0_40px_rgba(139,124,255,0.08)]',
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', glow = 'none', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          paddingClasses[padding],
          glowClasses[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Sub-components
export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-[#F5F7FA]', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-[#929BAD] mt-1', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-white/[0.06] flex items-center', className)} {...props}>
      {children}
    </div>
  )
}

export { Card }
export default Card
