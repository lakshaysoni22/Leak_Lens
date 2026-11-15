import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-br from-[#A3FF6F] to-[#7ADB4A]
    text-[#080B12] font-semibold
    hover:shadow-[0_0_30px_rgba(163,255,111,0.4)]
    hover:-translate-y-0.5
    active:scale-[0.98]
  `,
  secondary: `
    bg-transparent border border-white/15 text-[#F5F7FA] font-medium
    hover:border-[#A3FF6F]/40 hover:bg-[#A3FF6F]/5
    active:scale-[0.98]
  `,
  ghost: `
    bg-transparent text-[#929BAD] font-medium
    hover:text-[#F5F7FA] hover:bg-white/5
    active:scale-[0.98]
  `,
  danger: `
    bg-gradient-to-br from-[#FF5A5A] to-[#E03E3E]
    text-white font-semibold
    hover:shadow-[0_0_30px_rgba(255,90,90,0.4)]
    hover:-translate-y-0.5
    active:scale-[0.98]
  `,
  outline: `
    bg-transparent border border-[#A3FF6F]/30 text-[#A3FF6F] font-medium
    hover:bg-[#A3FF6F]/08 hover:border-[#A3FF6F]/60
    active:scale-[0.98]
  `,
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-[10px]',
  lg: 'px-6 py-3 text-base rounded-[10px]',
  xl: 'px-8 py-4 text-lg rounded-xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3FF6F]/50',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
