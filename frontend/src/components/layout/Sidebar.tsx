import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  User,
  Globe,
  AlertTriangle,
  Shield,
  BarChart3,
  History,
  FileText,
  Activity,
  Bell,
  Plug,
  Code,
  UserCircle,
  Lock,
  Eye,
  CreditCard,
  HelpCircle,
  Bot,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

interface NavSection {
  label: string;
  items: {
    label: string;
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    label: 'OVERVIEW',
    items: [
      { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { label: 'Email Scanner', to: '/app/scan/email', icon: Mail },
      { label: 'Username Scanner', to: '/app/scan/username', icon: User },
      { label: 'Domain Scanner', to: '/app/scan/domain', icon: Globe },
      { label: 'Phishing Detection', to: '/app/scan/phishing', icon: AlertTriangle },
      { label: 'Threat Intelligence', to: '/app/threat-intel', icon: Shield },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { label: 'Risk Analytics', to: '/app/analytics', icon: BarChart3 },
      { label: 'Exposure History', to: '/app/history', icon: History },
      { label: 'Reports', to: '/app/reports', icon: FileText },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { label: 'Monitoring', to: '/app/monitoring', icon: Activity },
      { label: 'Notifications', to: '/app/notifications', icon: Bell },
      { label: 'Integrations', to: '/app/integrations', icon: Plug },
      { label: 'API Access', to: '/app/api-keys', icon: Code },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { label: 'Profile', to: '/app/profile', icon: UserCircle },
      { label: 'Security', to: '/app/security', icon: Lock },
      { label: 'Privacy Center', to: '/app/privacy-center', icon: Eye },
      { label: 'Subscription', to: '/app/subscription', icon: CreditCard },
      { label: 'Help', to: '/app/help', icon: HelpCircle },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, className }) => {
  return (
    <aside
      className={cn(
        'relative h-screen flex flex-col bg-[#0D1220] border-r border-white/[0.08] transition-all duration-300 ease-in-out select-none z-30 shrink-0',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Top Header / Logo */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-white/[0.08] px-4 transition-all',
          isCollapsed ? 'justify-center' : 'justify-start'
        )}
      >
        <NavLink to="/app/dashboard" className="flex items-center gap-2">
          <Logo size="sm" showText={!isCollapsed} />
        </NavLink>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#929BAD]/60 mb-1.5">
                {section.label}
              </div>
            ) : (
              <div className="w-6 h-px bg-white/[0.06] mx-auto my-2" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'sidebar-link group relative',
                        isActive ? 'active text-[#A3FF6F] bg-[#A3FF6F]/10 font-medium' : 'text-[#929BAD]',
                        isCollapsed && 'justify-center px-2 py-2.5'
                      )
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-sm">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-[#A3FF6F]/15 text-[#A3FF6F]">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {/* AI Assistant Special Feature Card */}
        <div className="pt-2">
          <NavLink
            to="/app/assistant"
            title={isCollapsed ? 'AI Security Assistant' : undefined}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 overflow-hidden',
                isActive
                  ? 'border-[#A3FF6F]/50 bg-gradient-to-r from-[#8B7CFF]/25 via-[#45D6FF]/20 to-[#A3FF6F]/25 text-[#F5F7FA] shadow-[0_0_20px_rgba(163,255,111,0.15)]'
                  : 'border-[#8B7CFF]/30 bg-gradient-to-r from-[#8B7CFF]/15 via-[#45D6FF]/10 to-[#A3FF6F]/15 hover:border-[#8B7CFF]/60 text-[#F5F7FA]',
                isCollapsed && 'justify-center p-2.5'
              )
            }
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-[#45D6FF] group-hover:text-[#A3FF6F] transition-colors" />
              <Sparkles className="w-2.5 h-2.5 text-[#A3FF6F] absolute -top-1 -right-1 animate-pulse" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[#F5F7FA] flex items-center justify-between">
                  <span>AI Assistant</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#8B7CFF]/25 text-[#8B7CFF] border border-[#8B7CFF]/40 font-mono">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-[#929BAD] truncate">Ask about threats</p>
              </div>
            )}
          </NavLink>
        </div>
      </div>

      {/* Collapse / Expand Toggle Button */}
      <div className="p-3 border-t border-white/[0.08] flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-xs text-[#929BAD] px-1">
            <span className="w-2 h-2 rounded-full bg-[#A3FF6F]" />
            <span className="font-mono text-[11px]">v1.2.0-secure</span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#929BAD] hover:text-[#F5F7FA] hover:bg-white/[0.08] transition-all',
            isCollapsed && 'mx-auto'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
