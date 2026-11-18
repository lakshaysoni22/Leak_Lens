import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedGradientProps {
  className?: string;
  children?: React.ReactNode;
}

const AnimatedGradient: React.FC<AnimatedGradientProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none',
        className
      )}
      aria-hidden="true"
    >
      <style>{`
        @keyframes leaklensGradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes leaklensOrbDrift {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(40px, -30px) scale(1.08);
          }
          66% {
            transform: translate(-30px, 40px) scale(0.95);
          }
        }
      `}</style>

      {/* Main shifting gradient layer */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            'linear-gradient(-45deg, #080B12 0%, #0D1220 25%, #181432 50%, #0F172A 75%, #080B12 100%)',
          backgroundSize: '300% 300%',
          animation: 'leaklensGradientShift 20s ease-in-out infinite',
        }}
      />

      {/* Subtle glowing ambient orbs */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, #45D6FF 0%, transparent 70%)',
          animation: 'leaklensOrbDrift 24s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full opacity-15 blur-[140px]"
        style={{
          background: 'radial-gradient(circle, #8B7CFF 0%, transparent 70%)',
          animation: 'leaklensOrbDrift 28s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute top-[40%] right-[25%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full opacity-10 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #A3FF6F 0%, transparent 70%)',
          animation: 'leaklensOrbDrift 22s ease-in-out 5s infinite',
        }}
      />

      {/* Subtle scanline / grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {children}
    </div>
  );
};

export default AnimatedGradient;
