interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: { icon: 24, text: 'text-base' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 40, text: 'text-2xl' },
  xl: { icon: 56, text: 'text-3xl' },
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const { icon, text } = sizeMap[size]

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="LeakLens logo"
      >
        <defs>
          <linearGradient id="ll-grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A3FF6F" />
            <stop offset="100%" stopColor="#45D6FF" />
          </linearGradient>
          <linearGradient id="ll-grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B7CFF" />
            <stop offset="100%" stopColor="#45D6FF" />
          </linearGradient>
          <filter id="ll-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background shield */}
        <path
          d="M24 4L8 10V22C8 31.4 15.2 40.1 24 44C32.8 40.1 40 31.4 40 22V10L24 4Z"
          fill="url(#ll-grad-green)"
          fillOpacity="0.12"
          stroke="url(#ll-grad-green)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Lens circle outer */}
        <circle
          cx="24"
          cy="22"
          r="10"
          stroke="url(#ll-grad-green)"
          strokeWidth="1.8"
          fill="none"
          filter="url(#ll-glow)"
        />

        {/* Lens circle inner */}
        <circle cx="24" cy="22" r="6" fill="url(#ll-grad-green)" fillOpacity="0.2" />

        {/* Scan line */}
        <line
          x1="14"
          y1="22"
          x2="34"
          y2="22"
          stroke="url(#ll-grad-green)"
          strokeWidth="1.2"
          strokeDasharray="2 2"
          opacity="0.6"
        />

        {/* Center dot */}
        <circle cx="24" cy="22" r="2.5" fill="url(#ll-grad-green)" />

        {/* Magnifier handle */}
        <line
          x1="31.5"
          y1="29.5"
          x2="37"
          y2="35"
          stroke="url(#ll-grad-green)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Leak drop */}
        <path
          d="M24 10 C24 10 20 14 20 16.5 C20 18.5 21.8 20 24 20 C26.2 20 28 18.5 28 16.5 C28 14 24 10 24 10Z"
          fill="url(#ll-grad-purple)"
          fillOpacity="0.8"
          transform="translate(0 -4) scale(0.7) translate(10.3 5)"
        />
      </svg>

      {showText && (
        <span className={`font-bold tracking-tight ${text}`}>
          <span className="gradient-text-green">Leak</span>
          <span className="text-[#F5F7FA]">Lens</span>
        </span>
      )}
    </div>
  )
}
