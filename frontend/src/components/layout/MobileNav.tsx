import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Bell,
  FileText,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Scan', to: '/app/scan/email', icon: Search },
  { label: 'Alerts', to: '/app/notifications', icon: Bell },
  { label: 'Reports', to: '/app/reports', icon: FileText },
  { label: 'Profile', to: '/app/profile', icon: UserCircle },
];

export const MobileNav: React.FC = () => {
  return (
    <nav
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-40',
        'bg-[#080B12]/90 backdrop-blur-xl border-t border-white/[0.08]',
        'px-2 py-2 flex items-center justify-around'
      )}
      aria-label="Mobile Bottom Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all',
                isActive
                  ? 'text-[#A3FF6F] scale-105'
                  : 'text-[#929BAD] hover:text-[#F5F7FA]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#A3FF6F]" />
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-tight">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileNav;
