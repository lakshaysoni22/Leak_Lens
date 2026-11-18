import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  User,
  Shield,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Command,
} from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';

export interface TopBarProps {
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ className }) => {
  const { user, clearAuth } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/auth/login');
  };

  // Generate breadcrumb from current route
  const getBreadcrumb = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return 'Dashboard';
    const lastPart = parts[parts.length - 1];
    return lastPart
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/scan/email?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className={cn(
        'h-16 px-4 sm:px-6 flex items-center justify-between gap-4 bg-[#080B12]/80 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-20',
        className
      )}
    >
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-2 text-sm text-[#929BAD] min-w-0">
        <span className="hidden sm:inline hover:text-[#F5F7FA] transition-colors">
          App
        </span>
        <span className="hidden sm:inline text-white/20">/</span>
        <h1 className="text-base font-semibold text-[#F5F7FA] truncate">
          {getBreadcrumb()}
        </h1>
      </div>

      {/* Center: Search input (glass styled) */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#929BAD]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scans, breach intel, domains... (⌘K)"
            className="w-full pl-10 pr-10 py-2 rounded-xl bg-white/[0.04] border border-white/[0.09] text-xs sm:text-sm text-[#F5F7FA] placeholder-[#929BAD]/60 focus:outline-none focus:border-[#A3FF6F]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#A3FF6F]/10 transition-all"
          />
          <kbd className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-[#929BAD] bg-white/[0.06] rounded border border-white/[0.08]">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#929BAD] hover:text-[#F5F7FA] hover:bg-white/[0.08] transition-all"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#A3FF6F] ring-2 ring-[#080B12]" />
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0D1220] border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-3 z-50"
              >
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/[0.08] mb-2">
                  <span className="text-xs font-semibold text-[#F5F7FA]">Notifications</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A3FF6F]/15 text-[#A3FF6F] font-semibold">
                    2 New
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#A3FF6F] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-[#F5F7FA]">Automated Scan Complete</div>
                      <div className="text-[11px] text-[#929BAD]">No critical exposures detected on primary domain.</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#FFB547] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-[#F5F7FA]">New Threat Signature</div>
                      <div className="text-[11px] text-[#929BAD]">Global botnet vector catalog updated.</div>
                    </div>
                  </div>
                </div>
                <Link
                  to="/app/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="block text-center text-xs text-[#A3FF6F] hover:underline pt-2 mt-2 border-t border-white/[0.08]"
                >
                  View all notifications
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.2] transition-all"
            aria-expanded={dropdownOpen}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#A3FF6F]/20 to-[#45D6FF]/30 border border-[#A3FF6F]/40 flex items-center justify-center text-xs font-bold text-[#A3FF6F]">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden md:inline text-xs font-medium text-[#F5F7FA] max-w-[100px] truncate">
              {user?.full_name ?? user?.username ?? 'Security User'}
            </span>
            <ChevronDown className={cn('w-3.5 h-3.5 text-[#929BAD] transition-transform', dropdownOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0D1220] border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-2 z-50"
              >
                {/* User Info Header */}
                <div className="px-3 py-2.5 border-b border-white/[0.08]">
                  <div className="text-sm font-semibold text-[#F5F7FA] truncate">
                    {user?.full_name ?? user?.username ?? 'Security User'}
                  </div>
                  <div className="text-xs text-[#929BAD] truncate mt-0.5">
                    {user?.email ?? 'user@leaklens.internal'}
                  </div>
                </div>

                {/* Dropdown Links */}
                <div className="py-1">
                  <Link
                    to="/app/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#F5F7FA] hover:bg-white/[0.06] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#929BAD]" />
                    <span>Profile & Account</span>
                  </Link>
                  <Link
                    to="/app/security"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#F5F7FA] hover:bg-white/[0.06] transition-colors"
                  >
                    <Shield className="w-4 h-4 text-[#929BAD]" />
                    <span>Security Settings</span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.08] my-1" />

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#FF5A5A] hover:bg-[#FF5A5A]/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
